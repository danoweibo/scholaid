import { eq, and } from 'drizzle-orm';
import { db } from '@/db/index';
import * as mail from '@/mail/index';
import {
  lecturers, institutions, institutionLecturerRequests,
  studentLecturers, studentInstitutions, students, user,
} from '@/db/schema';
import type { AuthSession } from '@/middleware/auth';

export async function lecturerConnect(
  session: AuthSession,
  body: { institutionId: string; staffEmailDomain: string; employeeId: string },
) {
  const [lecturer] = await db.select().from(lecturers).where(eq(lecturers.userId, session.user.id));
  if (!lecturer) throw { statusCode: 403, message: 'Lecturer profile not found.' };
  if (lecturer.institutionConnection === 'verified')
    throw { statusCode: 409, message: 'Already connected to an institution. Leave first.' };

  const [institution] = await db.select().from(institutions).where(eq(institutions.institutionId, body.institutionId));
  if (!institution) throw { statusCode: 404, message: `Institution "${body.institutionId}" not found.` };

  const [existing] = await db.select({ id: institutionLecturerRequests.id }).from(institutionLecturerRequests)
    .where(and(eq(institutionLecturerRequests.lecturerId, lecturer.id), eq(institutionLecturerRequests.institutionId, institution.id), eq(institutionLecturerRequests.status, 'pending')));
  if (existing) throw { statusCode: 409, message: 'A pending connection request already exists for this institution.' };

  const [request] = await db.insert(institutionLecturerRequests).values({
    lecturerId: lecturer.id, institutionId: institution.id, initiator: 'lecturer',
    staffEmailDomain: body.staffEmailDomain, employeeId: body.employeeId,
  }).returning({ id: institutionLecturerRequests.id });

  await db.update(lecturers).set({
    institutionId: institution.id, institutionConnection: 'pending',
    staffEmailDomain: body.staffEmailDomain, employeeId: body.employeeId,
    status: 'institution_pending', updatedAt: new Date(),
  }).where(eq(lecturers.id, lecturer.id));

  return { message: 'Connection request submitted. Awaiting institution approval.', requestId: request.id };
}

export async function approveRequest(requestId: string, session: AuthSession) {
  const [institution] = await db.select().from(institutions).where(eq(institutions.adminUserId, session.user.id));
  if (!institution) throw { statusCode: 403, message: 'Institution profile not found.' };

  const [request] = await db.select().from(institutionLecturerRequests)
    .where(and(eq(institutionLecturerRequests.id, requestId), eq(institutionLecturerRequests.institutionId, institution.id), eq(institutionLecturerRequests.status, 'pending')));
  if (!request) throw { statusCode: 404, message: 'Pending request not found.' };

  await establishConnection(request.lecturerId, institution.id);
  await db.update(institutionLecturerRequests).set({ status: 'approved', resolvedAt: new Date() }).where(eq(institutionLecturerRequests.id, requestId));

  const [lecturerUser] = await db.select({ email: user.email, name: user.name })
    .from(lecturers).innerJoin(user, eq(lecturers.userId, user.id)).where(eq(lecturers.id, request.lecturerId));
  if (lecturerUser)
    await mail.sendLecturerConnectionApproved({ to: lecturerUser.email, lecturerName: lecturerUser.name, institutionName: institution.name });

  return { message: 'Connection approved. Lecturer is now verified.' };
}

export async function institutionInviteLecturer(session: AuthSession, body: { lecturerId: string }) {
  const [institution] = await db.select().from(institutions).where(eq(institutions.adminUserId, session.user.id));
  if (!institution) throw { statusCode: 403, message: 'Institution profile not found.' };

  const [lecturer] = await db.select().from(lecturers).where(eq(lecturers.lecturerId, body.lecturerId));
  if (!lecturer) throw { statusCode: 404, message: `Lecturer "${body.lecturerId}" not found.` };
  if (lecturer.institutionConnection === 'verified')
    throw { statusCode: 409, message: 'This lecturer is already connected to an institution.' };

  if (lecturer.institutionId === institution.id &&
    (lecturer.institutionConnection === 'placeholder' || lecturer.institutionConnection === 'pending')) {
    await establishConnection(lecturer.id, institution.id);
    return { message: 'Auto-connected — lecturer already had this institution as a placeholder.', requestId: 'auto' };
  }

  const [existing] = await db.select({ id: institutionLecturerRequests.id }).from(institutionLecturerRequests)
    .where(and(eq(institutionLecturerRequests.lecturerId, lecturer.id), eq(institutionLecturerRequests.institutionId, institution.id), eq(institutionLecturerRequests.status, 'pending')));
  if (existing) throw { statusCode: 409, message: 'A pending request already exists for this lecturer.' };

  const [request] = await db.insert(institutionLecturerRequests).values({
    lecturerId: lecturer.id, institutionId: institution.id, initiator: 'institution',
  }).returning({ id: institutionLecturerRequests.id });

  const [lecturerUser] = await db.select({ email: user.email, name: user.name }).from(user).where(eq(user.id, lecturer.userId));
  if (lecturerUser)
    await mail.sendLecturerConnectionInvite({ to: lecturerUser.email, lecturerName: lecturerUser.name, institutionName: institution.name, requestId: request.id });

  return { message: 'Invite sent to lecturer.', requestId: request.id };
}

export async function lecturerAcceptInvite(requestId: string, session: AuthSession) {
  const [lecturer] = await db.select().from(lecturers).where(eq(lecturers.userId, session.user.id));
  if (!lecturer) throw { statusCode: 403, message: 'Lecturer profile not found.' };
  if (lecturer.institutionConnection === 'verified')
    throw { statusCode: 409, message: 'You are already connected to an institution.' };

  const [request] = await db.select().from(institutionLecturerRequests)
    .where(and(eq(institutionLecturerRequests.id, requestId), eq(institutionLecturerRequests.lecturerId, lecturer.id), eq(institutionLecturerRequests.initiator, 'institution'), eq(institutionLecturerRequests.status, 'pending')));
  if (!request) throw { statusCode: 404, message: 'Pending institution invite not found.' };

  await establishConnection(lecturer.id, request.institutionId);
  await db.update(institutionLecturerRequests).set({ status: 'approved', resolvedAt: new Date() }).where(eq(institutionLecturerRequests.id, requestId));

  return { message: 'Connection established.' };
}

export async function removeLecturer(lecturerPublicId: string, session: AuthSession) {
  const [institution] = await db.select().from(institutions).where(eq(institutions.adminUserId, session.user.id));
  if (!institution) throw { statusCode: 403, message: 'Institution profile not found.' };

  const [lecturer] = await db.select().from(lecturers)
    .where(and(eq(lecturers.lecturerId, lecturerPublicId), eq(lecturers.institutionId, institution.id), eq(lecturers.institutionConnection, 'verified')));
  if (!lecturer) throw { statusCode: 404, message: 'Verified lecturer not found under this institution.' };

  await db.update(lecturers).set({ status: 'suspended', institutionId: null, institutionConnection: null, updatedAt: new Date() }).where(eq(lecturers.id, lecturer.id));
  await unlinkExclusiveStudents(lecturer.id, institution.id);

  return { message: 'Lecturer removed and suspended.' };
}

export async function lecturerLeave(session: AuthSession) {
  const [lecturer] = await db.select().from(lecturers).where(eq(lecturers.userId, session.user.id));
  if (!lecturer) throw { statusCode: 403, message: 'Lecturer profile not found.' };
  if (lecturer.institutionConnection !== 'verified')
    throw { statusCode: 400, message: 'You are not currently connected to an institution.' };

  const institutionId = lecturer.institutionId!;
  const [enrolmentCount] = await db.select({ count: studentLecturers.id }).from(studentLecturers).where(eq(studentLecturers.lecturerId, lecturer.id));
  const newStatus = enrolmentCount ? 'standalone_active' : 'standalone_no_students';

  await db.update(lecturers).set({ status: newStatus, institutionId: null, institutionConnection: null, updatedAt: new Date() }).where(eq(lecturers.id, lecturer.id));
  await unlinkExclusiveStudents(lecturer.id, institutionId);

  return { message: 'You have left the institution. Account reverted to standalone.' };
}

async function establishConnection(lecturerId: string, institutionId: string) {
  await db.update(lecturers).set({ institutionId, institutionConnection: 'verified', status: 'institution_verified', updatedAt: new Date() }).where(eq(lecturers.id, lecturerId));
  await db.update(institutions).set({ status: 'active_domain', updatedAt: new Date() }).where(eq(institutions.id, institutionId));
}

async function unlinkExclusiveStudents(lecturerId: string, institutionId: string) {
  const enrolments = await db.select({ studentId: studentLecturers.studentId }).from(studentLecturers).where(eq(studentLecturers.lecturerId, lecturerId));
  if (!enrolments.length) return;

  const studentIds = enrolments.map((e) => e.studentId);
  const otherCoveredIds: string[] = [];

  for (const studentId of studentIds) {
    const [otherLecturer] = await db.select({ id: studentLecturers.id }).from(studentLecturers)
      .innerJoin(lecturers, eq(studentLecturers.lecturerId, lecturers.id))
      .where(and(eq(studentLecturers.studentId, studentId), eq(lecturers.institutionId, institutionId), eq(lecturers.institutionConnection, 'verified')));
    if (otherLecturer) otherCoveredIds.push(studentId);
  }

  const exclusiveIds = studentIds.filter((id) => !otherCoveredIds.includes(id));
  if (!exclusiveIds.length) return;

  const [institutionRow] = await db.select({ name: institutions.name }).from(institutions).where(eq(institutions.id, institutionId));
  const [lecturerRow] = await db.select({ name: user.name }).from(lecturers).innerJoin(user, eq(lecturers.userId, user.id)).where(eq(lecturers.id, lecturerId));

  for (const studentId of exclusiveIds) {
    await db.delete(studentInstitutions).where(and(eq(studentInstitutions.studentId, studentId), eq(studentInstitutions.institutionId, institutionId)));
    const [studentUser] = await db.select({ email: user.email, name: user.name }).from(students).innerJoin(user, eq(students.userId, user.id)).where(eq(students.id, studentId));
    if (studentUser && institutionRow && lecturerRow)
      await mail.sendStudentUnlinkedNotification({ to: studentUser.email, studentName: studentUser.name, institutionName: institutionRow.name, lecturerName: lecturerRow.name });
  }
}
