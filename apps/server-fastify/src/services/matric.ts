import { eq, and } from 'drizzle-orm';
import { db } from '@/db/index';
import * as mail from '@/mail/index';
import { studentInstitutions, institutions, students, user } from '@/db/schema';
import type { AuthSession } from '@/middleware/auth';

export async function submit(
  session: AuthSession,
  body: { institutionId: string; matricNumber: string },
) {
  const [student] = await db.select({ id: students.id }).from(students).where(eq(students.userId, session.user.id));
  if (!student) throw { statusCode: 403, message: 'Student profile not found.' };

  const [institution] = await db.select({ id: institutions.id, name: institutions.name, matricVerificationMode: institutions.matricVerificationMode })
    .from(institutions).where(eq(institutions.institutionId, body.institutionId));
  if (!institution) throw { statusCode: 404, message: `Institution "${body.institutionId}" not found.` };

  const [membership] = await db.select().from(studentInstitutions)
    .where(and(eq(studentInstitutions.studentId, student.id), eq(studentInstitutions.institutionId, institution.id)));
  if (!membership) throw { statusCode: 404, message: 'No pending membership found for this institution.' };
  if (membership.status === 'full') throw { statusCode: 400, message: 'You are already a full member of this institution.' };
  if (membership.matricVerificationStatus === 'approved') throw { statusCode: 400, message: 'Matric number already verified.' };

  await db.update(studentInstitutions).set({ matricNumber: body.matricNumber, matricVerificationStatus: 'pending' }).where(eq(studentInstitutions.id, membership.id));

  if (institution.matricVerificationMode === 'programmatic') {
    const verified = await runProgrammaticCheck(session.user.name, body.matricNumber, institution.id);
    if (verified) {
      await grantFullMembership(membership.id);
      return { message: 'Matric number verified automatically. You are now a full institution member.', status: 'approved' };
    } else {
      await db.update(studentInstitutions).set({ matricVerificationStatus: 'rejected' }).where(eq(studentInstitutions.id, membership.id));
      return { message: 'Matric number could not be verified automatically. Please contact the institution.', status: 'rejected' };
    }
  }

  return { message: 'Matric number submitted. The institution will review your application.', status: 'pending' };
}

export async function approve(membershipId: string, session: AuthSession) {
  const membership = await getMembershipForInstitution(membershipId, session);
  if (membership.matricVerificationStatus === 'approved') throw { statusCode: 400, message: 'Already approved.' };
  await grantFullMembership(membership.id);
  await notifyStudent(membership.studentId, 'approved', membership.institutionId);
  return { message: 'Membership approved. Student is now a full institution member.' };
}

export async function reject(membershipId: string, session: AuthSession) {
  const membership = await getMembershipForInstitution(membershipId, session);
  if (membership.matricVerificationStatus === 'rejected') throw { statusCode: 400, message: 'Already rejected.' };
  await db.update(studentInstitutions).set({ matricVerificationStatus: 'rejected' }).where(eq(studentInstitutions.id, membershipId));
  await notifyStudent(membership.studentId, 'rejected', membership.institutionId);
  return { message: 'Membership rejected.' };
}

export async function listPending(session: AuthSession) {
  const [institution] = await db.select({ id: institutions.id }).from(institutions).where(eq(institutions.adminUserId, session.user.id));
  if (!institution) throw { statusCode: 403, message: 'Institution profile not found.' };

  const pending = await db.select({
    membershipId: studentInstitutions.id,
    studentId: studentInstitutions.studentId,
    matricNumber: studentInstitutions.matricNumber,
    matricVerificationStatus: studentInstitutions.matricVerificationStatus,
    joinedAt: studentInstitutions.joinedAt,
  }).from(studentInstitutions)
    .where(and(eq(studentInstitutions.institutionId, institution.id), eq(studentInstitutions.matricVerificationStatus, 'pending')));

  return { pending };
}

async function runProgrammaticCheck(_name: string, _matric: string, _institutionId: string): Promise<boolean> {
  return true; // placeholder — replace with real API call
}

async function grantFullMembership(membershipId: string) {
  await db.update(studentInstitutions).set({ status: 'full', matricVerificationStatus: 'approved', verifiedAt: new Date() }).where(eq(studentInstitutions.id, membershipId));
}

async function getMembershipForInstitution(membershipId: string, session: AuthSession) {
  const [institution] = await db.select({ id: institutions.id }).from(institutions).where(eq(institutions.adminUserId, session.user.id));
  if (!institution) throw { statusCode: 403, message: 'Institution profile not found.' };
  const [membership] = await db.select().from(studentInstitutions)
    .where(and(eq(studentInstitutions.id, membershipId), eq(studentInstitutions.institutionId, institution.id)));
  if (!membership) throw { statusCode: 404, message: 'Membership not found.' };
  return membership;
}

async function notifyStudent(studentId: string, outcome: 'approved' | 'rejected', institutionId: string) {
  const [studentRow] = await db.select({ userId: students.userId }).from(students).where(eq(students.id, studentId));
  if (!studentRow) return;
  const [userRow] = await db.select({ email: user.email, name: user.name }).from(user).where(eq(user.id, studentRow.userId));
  const [institutionRow] = await db.select({ name: institutions.name }).from(institutions).where(eq(institutions.id, institutionId));
  if (!userRow || !institutionRow) return;
  await mail.sendMatricVerificationOutcome({ to: userRow.email, studentName: userRow.name, institutionName: institutionRow.name, outcome });
}
