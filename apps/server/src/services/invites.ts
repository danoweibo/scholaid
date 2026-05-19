import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/index.js";
import * as mail from "@/mail/index.js";
import {
  invites,
  lecturers,
  students,
  studentLecturers,
  studentInstitutions,
  user,
} from "@/db/schema.js";
import type { AuthSession } from "@/middleware/auth.js";

export async function dispatch(
  session: AuthSession,
  body: { inviteeEmail?: string; inviteeStudentId?: string },
): Promise<{ message: string; inviteId: string }> {
  if (!body.inviteeEmail && !body.inviteeStudentId)
    throw {
      statusCode: 400,
      message: "Provide either inviteeEmail or inviteeStudentId.",
    };
  if (body.inviteeEmail && body.inviteeStudentId)
    throw {
      statusCode: 400,
      message: "Provide either inviteeEmail or inviteeStudentId, not both.",
    };

  const [lecturer] = await db
    .select()
    .from(lecturers)
    .where(eq(lecturers.userId, session.user.id));
  if (!lecturer)
    throw { statusCode: 403, message: "Lecturer profile not found." };

  let resolvedEmail: string | null = body.inviteeEmail ?? null;

  if (body.inviteeStudentId) {
    const [studentRow] = await db
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.studentId, body.inviteeStudentId));
    if (!studentRow)
      throw {
        statusCode: 404,
        message: `No student found with studentId "${body.inviteeStudentId}".`,
      };
    const [userRow] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, studentRow.userId));
    resolvedEmail = userRow?.email ?? null;
  }

  if (!resolvedEmail)
    throw { statusCode: 400, message: "Could not resolve invitee email." };

  const [existingInvite] = await db
    .select({
      id: invites.id,
      status: invites.status,
      expiresAt: invites.expiresAt,
    })
    .from(invites)
    .where(
      and(
        eq(invites.lecturerId, lecturer.id),
        eq(invites.inviteeEmail, resolvedEmail),
        eq(invites.status, "pending"),
      ),
    );

  if (existingInvite && existingInvite.expiresAt > new Date())
    throw {
      statusCode: 409,
      message: "A pending invite already exists for this email.",
    };

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

  const [invite] = await db
    .insert(invites)
    .values({
      token,
      lecturerId: lecturer.id,
      inviteeEmail: resolvedEmail,
      inviteeStudentId: body.inviteeStudentId ?? null,
      status: "pending",
      expiresAt,
    })
    .returning({ id: invites.id });

  await mail.sendStudentInvite({
    to: resolvedEmail,
    token,
    lecturerName: session.user.name,
  });

  return { message: "Invite dispatched successfully.", inviteId: invite.id };
}

export async function inspect(token: string) {
  const [invite] = await db
    .select({
      id: invites.id,
      status: invites.status,
      expiresAt: invites.expiresAt,
      inviteeEmail: invites.inviteeEmail,
      inviteeStudentId: invites.inviteeStudentId,
      lecturerId: invites.lecturerId,
    })
    .from(invites)
    .where(eq(invites.token, token));

  if (!invite) throw { statusCode: 404, message: "Invite not found." };
  if (invite.status !== "pending")
    throw { statusCode: 400, message: `Invite is already ${invite.status}.` };
  if (invite.expiresAt < new Date()) {
    await db
      .update(invites)
      .set({ status: "expired" })
      .where(eq(invites.id, invite.id));
    throw { statusCode: 400, message: "Invite has expired." };
  }

  return {
    inviteId: invite.id,
    inviteeEmail: invite.inviteeEmail,
    expiresAt: invite.expiresAt,
    status: invite.status,
  };
}

export async function accept(
  token: string,
  currentUserId: string | null,
): Promise<{ message: string }> {
  const [invite] = await db
    .select()
    .from(invites)
    .where(and(eq(invites.token, token), eq(invites.status, "pending")));

  if (!invite)
    throw { statusCode: 404, message: "Invite not found or already used." };
  if (invite.expiresAt < new Date()) {
    await db
      .update(invites)
      .set({ status: "expired" })
      .where(eq(invites.id, invite.id));
    throw { statusCode: 400, message: "Invite has expired." };
  }

  let studentRow: typeof students.$inferSelect | null = null;

  if (currentUserId) {
    const [found] = await db
      .select()
      .from(students)
      .where(eq(students.userId, currentUserId));
    studentRow = found ?? null;
  } else if (invite.inviteeEmail) {
    const [userRow] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, invite.inviteeEmail));
    if (userRow) {
      const [found] = await db
        .select()
        .from(students)
        .where(eq(students.userId, userRow.id));
      studentRow = found ?? null;
    }
  }

  if (!studentRow) return { message: "NO_ACCOUNT" };

  if (studentRow.type === "enthusiast") {
    await db
      .update(students)
      .set({ type: "standard", updatedAt: new Date() })
      .where(eq(students.id, studentRow.id));
  }

  const [existing] = await db
    .select({ id: studentLecturers.id })
    .from(studentLecturers)
    .where(
      and(
        eq(studentLecturers.studentId, studentRow.id),
        eq(studentLecturers.lecturerId, invite.lecturerId),
      ),
    );

  if (existing) {
    await markAccepted(invite.id);
    return { message: "Already enrolled under this lecturer." };
  }

  await db
    .insert(studentLecturers)
    .values({ studentId: studentRow.id, lecturerId: invite.lecturerId });

  const [lecturerRow] = await db
    .select()
    .from(lecturers)
    .where(eq(lecturers.id, invite.lecturerId));

  if (lecturerRow?.status === "standalone_no_students") {
    await db
      .update(lecturers)
      .set({ status: "standalone_active", updatedAt: new Date() })
      .where(eq(lecturers.id, invite.lecturerId));
  }

  if (
    lecturerRow?.institutionId &&
    lecturerRow.institutionConnection === "verified"
  ) {
    const [existingMembership] = await db
      .select({ id: studentInstitutions.id })
      .from(studentInstitutions)
      .where(
        and(
          eq(studentInstitutions.studentId, studentRow.id),
          eq(studentInstitutions.institutionId, lecturerRow.institutionId),
        ),
      );
    if (!existingMembership) {
      await db
        .insert(studentInstitutions)
        .values({
          studentId: studentRow.id,
          institutionId: lecturerRow.institutionId,
          status: "pending",
        });
    }
  }

  await markAccepted(invite.id);
  return { message: "Invite accepted. Enrolment complete." };
}

export async function revoke(
  inviteId: string,
  session: AuthSession,
): Promise<{ message: string }> {
  const [lecturer] = await db
    .select({ id: lecturers.id })
    .from(lecturers)
    .where(eq(lecturers.userId, session.user.id));
  if (!lecturer)
    throw { statusCode: 403, message: "Lecturer profile not found." };

  const [invite] = await db
    .select()
    .from(invites)
    .where(and(eq(invites.id, inviteId), eq(invites.lecturerId, lecturer.id)));
  if (!invite) throw { statusCode: 404, message: "Invite not found." };
  if (invite.status !== "pending")
    throw {
      statusCode: 400,
      message: `Cannot revoke an invite with status "${invite.status}".`,
    };

  await db
    .update(invites)
    .set({ status: "revoked" })
    .where(eq(invites.id, inviteId));
  return { message: "Invite revoked." };
}

export async function revokeByToken(
  token: string,
  session: AuthSession,
): Promise<{ message: string }> {
  const [lecturer] = await db
    .select({ id: lecturers.id })
    .from(lecturers)
    .where(eq(lecturers.userId, session.user.id));
  if (!lecturer)
    throw { statusCode: 403, message: "Lecturer profile not found." };

  const [invite] = await db
    .select()
    .from(invites)
    .where(and(eq(invites.token, token), eq(invites.lecturerId, lecturer.id)));
  if (!invite) throw { statusCode: 404, message: "Invite not found." };
  if (invite.status !== "pending")
    throw {
      statusCode: 400,
      message: `Cannot revoke an invite with status "${invite.status}".`,
    };

  await db
    .update(invites)
    .set({ status: "revoked" })
    .where(eq(invites.id, invite.id));
  return { message: "Invite revoked." };
}

async function markAccepted(inviteId: string) {
  await db
    .update(invites)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(eq(invites.id, inviteId));
}
