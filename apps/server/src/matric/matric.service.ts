/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { eq, and } from 'drizzle-orm';
import { DBService } from '@/db/db.service';
import { MailService } from '@/mail/mail.service';
import { studentInstitutions, institutions, students, user } from '@/db/schema';
import type { ScholaidSession } from '@/auth/types/session.types';

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export class SubmitMatricDto {
  @IsString()
  @IsNotEmpty({ message: 'institutionId is required.' })
  institutionId!: string;

  @IsString()
  @IsNotEmpty({ message: 'matricNumber is required.' })
  matricNumber!: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class MatricService {
  constructor(
    private readonly db: DBService,
    private readonly mail: MailService,
  ) {}

  // -------------------------------------------------------------------------
  // Student submits matric number
  // -------------------------------------------------------------------------

  async submit(
    session: ScholaidSession,
    dto: SubmitMatricDto,
  ): Promise<{ message: string; status: string }> {
    // Load the student's domain profile
    const [student] = await this.db.db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.userId, session.user.id));

    if (!student) {
      throw new ForbiddenException('Student profile not found.');
    }

    // Load the institution by public ID
    const [institution] = await this.db.db
      .select({
        id: institutions.id,
        name: institutions.name,
        matricVerificationMode: institutions.matricVerificationMode,
      })
      .from(institutions)
      .where(eq(institutions.institutionId, dto.institutionId));

    if (!institution) {
      throw new NotFoundException(
        `Institution "${dto.institutionId}" not found.`,
      );
    }

    // Load the pending membership row
    const [membership] = await this.db.db
      .select()
      .from(studentInstitutions)
      .where(
        and(
          eq(studentInstitutions.studentId, student.id),
          eq(studentInstitutions.institutionId, institution.id),
        ),
      );

    if (!membership) {
      throw new NotFoundException(
        'No pending membership found for this institution.',
      );
    }

    if (membership.status === 'full') {
      throw new BadRequestException(
        'You are already a full member of this institution.',
      );
    }

    if (membership.matricVerificationStatus === 'approved') {
      throw new BadRequestException('Matric number already verified.');
    }

    // Store the matric number
    await this.db.db
      .update(studentInstitutions)
      .set({
        matricNumber: dto.matricNumber,
        matricVerificationStatus: 'pending',
      })
      .where(eq(studentInstitutions.id, membership.id));

    // ---------------------------------------------------------------------------
    // Programmatic verification
    // If the institution has opted into programmatic mode, validate immediately.
    // In production, this would call institution.matricApiUrl with the student's
    // name + matric number. Here we wire the structure correctly and auto-approve
    // as a placeholder — replace with real API call when institutions provide it.
    // ---------------------------------------------------------------------------
    if (institution.matricVerificationMode === 'programmatic') {
      const verified = await this.runProgrammaticCheck(
        session.user.name,
        dto.matricNumber,
        institution.id,
      );

      if (verified) {
        await this.grantFullMembership(membership.id, student.id);
        return {
          message:
            'Matric number verified automatically. You are now a full institution member.',
          status: 'approved',
        };
      } else {
        await this.db.db
          .update(studentInstitutions)
          .set({ matricVerificationStatus: 'rejected' })
          .where(eq(studentInstitutions.id, membership.id));

        return {
          message:
            'Matric number could not be verified automatically. Please contact the institution.',
          status: 'rejected',
        };
      }
    }

    // Manual mode — submission recorded, institution admin will review
    return {
      message:
        'Matric number submitted. The institution will review your application.',
      status: 'pending',
    };
  }

  // -------------------------------------------------------------------------
  // Institution admin manually approves
  // -------------------------------------------------------------------------

  async approve(
    membershipId: string,
    session: ScholaidSession,
  ): Promise<{ message: string }> {
    const membership = await this.getMembershipForInstitution(
      membershipId,
      session,
    );

    if (membership.matricVerificationStatus === 'approved') {
      throw new BadRequestException('Already approved.');
    }

    await this.grantFullMembership(membership.id, membership.studentId);

    // Notify the student
    await this.notifyStudent(
      membership.studentId,
      'approved',
      membership.institutionId,
    );

    return {
      message: 'Membership approved. Student is now a full institution member.',
    };
  }

  // -------------------------------------------------------------------------
  // Institution admin manually rejects
  // -------------------------------------------------------------------------

  async reject(
    membershipId: string,
    session: ScholaidSession,
  ): Promise<{ message: string }> {
    const membership = await this.getMembershipForInstitution(
      membershipId,
      session,
    );

    if (membership.matricVerificationStatus === 'rejected') {
      throw new BadRequestException('Already rejected.');
    }

    await this.db.db
      .update(studentInstitutions)
      .set({ matricVerificationStatus: 'rejected' })
      .where(eq(studentInstitutions.id, membershipId));

    await this.notifyStudent(
      membership.studentId,
      'rejected',
      membership.institutionId,
    );

    return { message: 'Membership rejected.' };
  }

  // -------------------------------------------------------------------------
  // List pending memberships — institution admin view
  // -------------------------------------------------------------------------

  async listPending(session: ScholaidSession) {
    const [institution] = await this.db.db
      .select({ id: institutions.id })
      .from(institutions)
      .where(eq(institutions.adminUserId, session.user.id));

    if (!institution) {
      throw new ForbiddenException('Institution profile not found.');
    }

    const pending = await this.db.db
      .select({
        membershipId: studentInstitutions.id,
        studentId: studentInstitutions.studentId,
        matricNumber: studentInstitutions.matricNumber,
        matricVerificationStatus: studentInstitutions.matricVerificationStatus,
        joinedAt: studentInstitutions.joinedAt,
      })
      .from(studentInstitutions)
      .where(
        and(
          eq(studentInstitutions.institutionId, institution.id),
          eq(studentInstitutions.matricVerificationStatus, 'pending'),
        ),
      );

    return { pending };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Programmatic verification stub.
   * Replace the body with a real HTTP call to the institution's matric DB
   * when institutions provide their API endpoint.
   *
   * Expected contract: returns true if name + matric match, false otherwise.
   */
  private async runProgrammaticCheck(
    _studentName: string,
    _matricNumber: string,
    _institutionId: string,
  ): Promise<boolean> {
    // TODO: implement real API call per institution
    // e.g. await fetch(institution.matricApiUrl, { method: 'POST', body: ... })
    return true; // placeholder — auto-approves in programmatic mode
  }

  private async grantFullMembership(
    membershipId: string,
    _studentId: string,
  ): Promise<void> {
    await this.db.db
      .update(studentInstitutions)
      .set({
        status: 'full',
        matricVerificationStatus: 'approved',
        verifiedAt: new Date(),
      })
      .where(eq(studentInstitutions.id, membershipId));
  }

  private async getMembershipForInstitution(
    membershipId: string,
    session: ScholaidSession,
  ) {
    // Verify the calling user is the institution admin
    const [institution] = await this.db.db
      .select({ id: institutions.id })
      .from(institutions)
      .where(eq(institutions.adminUserId, session.user.id));

    if (!institution) {
      throw new ForbiddenException('Institution profile not found.');
    }

    const [membership] = await this.db.db
      .select()
      .from(studentInstitutions)
      .where(
        and(
          eq(studentInstitutions.id, membershipId),
          eq(studentInstitutions.institutionId, institution.id),
        ),
      );

    if (!membership) {
      throw new NotFoundException('Membership not found.');
    }

    return membership;
  }

  private async notifyStudent(
    studentId: string,
    outcome: 'approved' | 'rejected',
    institutionId: string,
  ): Promise<void> {
    // Load student email and institution name for the notification
    const [studentRow] = await this.db.db
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.id, studentId));

    if (!studentRow) return;

    const [userRow] = await this.db.db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, studentRow.userId));

    const [institutionRow] = await this.db.db
      .select({ name: institutions.name })
      .from(institutions)
      .where(eq(institutions.id, institutionId));

    if (!userRow || !institutionRow) return;

    await this.mail.sendMatricVerificationOutcome({
      to: userRow.email,
      studentName: userRow.name,
      institutionName: institutionRow.name,
      outcome,
    });
  }
}
