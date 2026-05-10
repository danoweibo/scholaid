import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { DBService } from '@/db/db.service';
import { MailService } from '@/mail/mail.service';
import {
  invites,
  lecturers,
  students,
  studentLecturers,
  studentInstitutions,
  user,
} from '@/db/schema';
import type { ScholaidSession } from '@/auth/types/session.types';

// ---------------------------------------------------------------------------
// DTOs (inline — move to separate files once the project grows)
// ---------------------------------------------------------------------------

export class DispatchInviteDto {
  /** Invite by email address OR by studentId — exactly one must be provided */
  @IsOptional()
  @IsEmail({}, { message: 'inviteeEmail must be a valid email address.' })
  inviteeEmail?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'inviteeStudentId must not be empty.' })
  inviteeStudentId?: string;
}

export class AcceptInviteDto {
  /** Only required when the invitee has no existing account */
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters.' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters.' })
  password?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class InvitesService {
  constructor(
    private readonly db: DBService,
    private readonly mail: MailService,
  ) {}

  // -------------------------------------------------------------------------
  // Dispatch — lecturer sends an invite
  // -------------------------------------------------------------------------

  async dispatch(
    session: ScholaidSession,
    dto: DispatchInviteDto,
  ): Promise<{ message: string; inviteId: string }> {
    // Exactly one target must be provided
    if (!dto.inviteeEmail && !dto.inviteeStudentId) {
      throw new BadRequestException(
        'Provide either inviteeEmail or inviteeStudentId.',
      );
    }
    if (dto.inviteeEmail && dto.inviteeStudentId) {
      throw new BadRequestException(
        'Provide either inviteeEmail or inviteeStudentId, not both.',
      );
    }

    // Load the lecturer profile for the current user
    const [lecturer] = await this.db.db
      .select()
      .from(lecturers)
      .where(eq(lecturers.userId, session.user.id));

    if (!lecturer) {
      throw new ForbiddenException('Lecturer profile not found.');
    }

    // Resolve invitee email — needed for the email dispatch
    let resolvedEmail: string | null = dto.inviteeEmail ?? null;

    if (dto.inviteeStudentId) {
      // Look up the student by their public studentId, then get their user email
      const [studentRow] = await this.db.db
        .select({ userId: students.userId })
        .from(students)
        .where(eq(students.studentId, dto.inviteeStudentId));

      if (!studentRow) {
        throw new NotFoundException(
          `No student found with studentId "${dto.inviteeStudentId}".`,
        );
      }

      const [userRow] = await this.db.db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.id, studentRow.userId));

      resolvedEmail = userRow?.email ?? null;
    }

    if (!resolvedEmail) {
      throw new BadRequestException('Could not resolve invitee email.');
    }

    // Check for an existing pending invite to the same email from this lecturer
    // to prevent duplicate spam
    const [existingInvite] = await this.db.db
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
          eq(invites.status, 'pending'),
        ),
      );

    if (existingInvite && existingInvite.expiresAt > new Date()) {
      throw new ConflictException(
        'A pending invite already exists for this email. Wait for it to expire or revoke it first.',
      );
    }

    // Create the invite row
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72h TTL

    const [invite] = await this.db.db
      .insert(invites)
      .values({
        token,
        lecturerId: lecturer.id,
        inviteeEmail: resolvedEmail,
        inviteeStudentId: dto.inviteeStudentId ?? null,
        status: 'pending',
        expiresAt,
      })
      .returning({ id: invites.id });

    // Send the email (non-blocking on failure — see MailService)
    await this.mail.sendStudentInvite({
      to: resolvedEmail,
      token,
      lecturerName: session.user.name,
    });

    return {
      message: 'Invite dispatched successfully.',
      inviteId: invite.id,
    };
  }

  // -------------------------------------------------------------------------
  // Inspect — anyone can look up an invite by token (public, used by frontend)
  // -------------------------------------------------------------------------

  async inspect(token: string) {
    const [invite] = await this.db.db
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

    if (!invite) {
      throw new NotFoundException('Invite not found.');
    }

    if (invite.status !== 'pending') {
      throw new BadRequestException(`Invite is already ${invite.status}.`);
    }

    if (invite.expiresAt < new Date()) {
      // Mark as expired lazily
      await this.db.db
        .update(invites)
        .set({ status: 'expired' })
        .where(eq(invites.id, invite.id));

      throw new BadRequestException('Invite has expired.');
    }

    return {
      inviteId: invite.id,
      inviteeEmail: invite.inviteeEmail,
      expiresAt: invite.expiresAt,
      status: invite.status,
    };
  }

  // -------------------------------------------------------------------------
  // Accept — the core state machine
  // -------------------------------------------------------------------------

  async accept(
    token: string,
    currentUserId: string | null, // null if the acceptor has no account yet
  ): Promise<{ message: string }> {
    // 1. Validate the token
    const [invite] = await this.db.db
      .select()
      .from(invites)
      .where(and(eq(invites.token, token), eq(invites.status, 'pending')));

    if (!invite) {
      throw new NotFoundException('Invite not found or already used.');
    }

    if (invite.expiresAt < new Date()) {
      await this.db.db
        .update(invites)
        .set({ status: 'expired' })
        .where(eq(invites.id, invite.id));
      throw new BadRequestException('Invite has expired.');
    }

    // 2. Resolve the student — find by current session or by invitee email/studentId
    let studentRow: typeof students.$inferSelect | null = null;

    if (currentUserId) {
      // Authenticated user — look up their student profile
      const [found] = await this.db.db
        .select()
        .from(students)
        .where(eq(students.userId, currentUserId));
      studentRow = found ?? null;
    } else if (invite.inviteeEmail) {
      // No session — check if an account exists for this email
      const [userRow] = await this.db.db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, invite.inviteeEmail));

      if (userRow) {
        const [found] = await this.db.db
          .select()
          .from(students)
          .where(eq(students.userId, userRow.id));
        studentRow = found ?? null;
      }
    }

    // 3. State machine
    if (!studentRow) {
      // ── Case A: No account exists ──────────────────────────────────────────
      // Return a signal to the frontend to redirect to registration with the
      // token pre-filled. Registration will create a standard student account
      // and then re-call accept with their new session.
      return {
        message: 'NO_ACCOUNT',
      };
    }

    // ── Case B: Enthusiast → upgrade to standard ────────────────────────────
    if (studentRow.type === 'enthusiast') {
      await this.db.db
        .update(students)
        .set({ type: 'standard', updatedAt: new Date() })
        .where(eq(students.id, studentRow.id));
    }

    // ── Case C: Already standard — just enrol (falls through from B) ────────

    // 4. Check for duplicate enrolment
    const [existing] = await this.db.db
      .select({ id: studentLecturers.id })
      .from(studentLecturers)
      .where(
        and(
          eq(studentLecturers.studentId, studentRow.id),
          eq(studentLecturers.lecturerId, invite.lecturerId),
        ),
      );

    if (existing) {
      // Already enrolled — still mark the invite as accepted and return cleanly
      await this.markAccepted(invite.id);
      return { message: 'Already enrolled under this lecturer.' };
    }

    // 5. Create the student ↔ lecturer enrolment row
    await this.db.db.insert(studentLecturers).values({
      studentId: studentRow.id,
      lecturerId: invite.lecturerId,
    });

    // 6. Upgrade lecturer status to standalone_active if this is their first student
    const [lecturerRow] = await this.db.db
      .select()
      .from(lecturers)
      .where(eq(lecturers.id, invite.lecturerId));

    if (lecturerRow?.status === 'standalone_no_students') {
      await this.db.db
        .update(lecturers)
        .set({ status: 'standalone_active', updatedAt: new Date() })
        .where(eq(lecturers.id, invite.lecturerId));
    }

    // 7. Institution propagation — if the lecturer has a verified institution,
    //    add the student as a pending institution member
    if (
      lecturerRow?.institutionId &&
      lecturerRow.institutionConnection === 'verified'
    ) {
      // Check the student isn't already a member of this institution
      const [existingMembership] = await this.db.db
        .select({ id: studentInstitutions.id })
        .from(studentInstitutions)
        .where(
          and(
            eq(studentInstitutions.studentId, studentRow.id),
            eq(studentInstitutions.institutionId, lecturerRow.institutionId),
          ),
        );

      if (!existingMembership) {
        await this.db.db.insert(studentInstitutions).values({
          studentId: studentRow.id,
          institutionId: lecturerRow.institutionId,
          status: 'pending',
        });
      }
    }

    // 8. Mark invite as accepted (single-use)
    await this.markAccepted(invite.id);

    return { message: 'Invite accepted. Enrolment complete.' };
  }

  // -------------------------------------------------------------------------
  // Revoke — lecturer cancels a pending invite
  // -------------------------------------------------------------------------

  async revoke(
    inviteId: string,
    session: ScholaidSession,
  ): Promise<{ message: string }> {
    const [lecturer] = await this.db.db
      .select({ id: lecturers.id })
      .from(lecturers)
      .where(eq(lecturers.userId, session.user.id));

    if (!lecturer) {
      throw new ForbiddenException('Lecturer profile not found.');
    }

    const [invite] = await this.db.db
      .select()
      .from(invites)
      .where(
        and(eq(invites.id, inviteId), eq(invites.lecturerId, lecturer.id)),
      );

    if (!invite) {
      throw new NotFoundException('Invite not found.');
    }

    if (invite.status !== 'pending') {
      throw new BadRequestException(
        `Cannot revoke an invite with status "${invite.status}".`,
      );
    }

    await this.db.db
      .update(invites)
      .set({ status: 'revoked' })
      .where(eq(invites.id, inviteId));

    return { message: 'Invite revoked.' };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async markAccepted(inviteId: string): Promise<void> {
    await this.db.db
      .update(invites)
      .set({ status: 'accepted', acceptedAt: new Date() })
      .where(eq(invites.id, inviteId));
  }

  // -------------------------------------------------------------------------
  // Revoke by token — used by the controller (token comes from the invite email)
  // -------------------------------------------------------------------------

  async revokeByToken(
    token: string,
    session: ScholaidSession,
  ): Promise<{ message: string }> {
    const [lecturer] = await this.db.db
      .select({ id: lecturers.id })
      .from(lecturers)
      .where(eq(lecturers.userId, session.user.id));

    if (!lecturer) {
      throw new ForbiddenException('Lecturer profile not found.');
    }

    const [invite] = await this.db.db
      .select()
      .from(invites)
      .where(
        and(eq(invites.token, token), eq(invites.lecturerId, lecturer.id)),
      );

    if (!invite) {
      throw new NotFoundException('Invite not found.');
    }

    if (invite.status !== 'pending') {
      throw new BadRequestException(
        `Cannot revoke an invite with status "${invite.status}".`,
      );
    }

    await this.db.db
      .update(invites)
      .set({ status: 'revoked' })
      .where(eq(invites.id, invite.id));

    return { message: 'Invite revoked.' };
  }
}
