import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DBService } from '@/db/db.service';
import { MailService } from '@/mail/mail.service';
import {
  lecturers,
  institutions,
  institutionLecturerRequests,
  studentLecturers,
  studentInstitutions,
  students,
  user,
} from '@/db/schema';
import type { ScholaidSession } from '@/auth/types/session.types';

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export class LecturerConnectDto {
  institutionId!: string;
  staffEmailDomain!: string;
  employeeId!: string;
}

export class InstitutionInviteLecturerDto {
  lecturerId!: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class InstitutionsService {
  constructor(
    private readonly db: DBService,
    private readonly mail: MailService,
  ) {}

  // -------------------------------------------------------------------------
  // Lecturer-initiated: submit a connection request to an institution
  // -------------------------------------------------------------------------

  async lecturerConnect(
    session: ScholaidSession,
    dto: LecturerConnectDto,
  ): Promise<{ message: string; requestId: string }> {
    const [lecturer] = await this.db.db
      .select()
      .from(lecturers)
      .where(eq(lecturers.userId, session.user.id));

    if (!lecturer) throw new ForbiddenException('Lecturer profile not found.');

    if (lecturer.institutionConnection === 'verified') {
      throw new ConflictException(
        'You are already connected to an institution. Leave first before connecting to another.',
      );
    }

    // Resolve institution by public ID
    const [institution] = await this.db.db
      .select()
      .from(institutions)
      .where(eq(institutions.institutionId, dto.institutionId));

    if (!institution) {
      throw new NotFoundException(
        `Institution "${dto.institutionId}" not found.`,
      );
    }

    // Block duplicate pending requests
    const [existing] = await this.db.db
      .select({ id: institutionLecturerRequests.id })
      .from(institutionLecturerRequests)
      .where(
        and(
          eq(institutionLecturerRequests.lecturerId, lecturer.id),
          eq(institutionLecturerRequests.institutionId, institution.id),
          eq(institutionLecturerRequests.status, 'pending'),
        ),
      );

    if (existing) {
      throw new ConflictException(
        'A pending connection request already exists for this institution.',
      );
    }

    // Create the request row
    const [request] = await this.db.db
      .insert(institutionLecturerRequests)
      .values({
        lecturerId: lecturer.id,
        institutionId: institution.id,
        initiator: 'lecturer',
        staffEmailDomain: dto.staffEmailDomain,
        employeeId: dto.employeeId,
      })
      .returning({ id: institutionLecturerRequests.id });

    // Update lecturer row to reflect pending state
    await this.db.db
      .update(lecturers)
      .set({
        institutionId: institution.id,
        institutionConnection: 'pending',
        staffEmailDomain: dto.staffEmailDomain,
        employeeId: dto.employeeId,
        status: 'institution_pending',
        updatedAt: new Date(),
      })
      .where(eq(lecturers.id, lecturer.id));

    return {
      message: 'Connection request submitted. Awaiting institution approval.',
      requestId: request.id,
    };
  }

  // -------------------------------------------------------------------------
  // Institution approves a lecturer-initiated request
  // -------------------------------------------------------------------------

  async approveRequest(
    requestId: string,
    session: ScholaidSession,
  ): Promise<{ message: string }> {
    const [institution] = await this.db.db
      .select()
      .from(institutions)
      .where(eq(institutions.adminUserId, session.user.id));

    if (!institution) {
      throw new ForbiddenException('Institution profile not found.');
    }

    const [request] = await this.db.db
      .select()
      .from(institutionLecturerRequests)
      .where(
        and(
          eq(institutionLecturerRequests.id, requestId),
          eq(institutionLecturerRequests.institutionId, institution.id),
          eq(institutionLecturerRequests.status, 'pending'),
        ),
      );

    if (!request) {
      throw new NotFoundException('Pending request not found.');
    }

    // Approve — establish the verified connection
    await this.establishConnection(request.lecturerId, institution.id);

    // Mark request resolved
    await this.db.db
      .update(institutionLecturerRequests)
      .set({ status: 'approved', resolvedAt: new Date() })
      .where(eq(institutionLecturerRequests.id, requestId));

    // Notify the lecturer
    const [lecturerUser] = await this.db.db
      .select({ email: user.email, name: user.name })
      .from(lecturers)
      .innerJoin(user, eq(lecturers.userId, user.id))
      .where(eq(lecturers.id, request.lecturerId));

    if (lecturerUser) {
      await this.mail.sendLecturerConnectionApproved({
        to: lecturerUser.email,
        lecturerName: lecturerUser.name,
        institutionName: institution.name,
      });
    }

    return { message: 'Connection approved. Lecturer is now verified.' };
  }

  // -------------------------------------------------------------------------
  // Institution-initiated: invite a lecturer to connect
  // -------------------------------------------------------------------------

  async institutionInviteLecturer(
    session: ScholaidSession,
    dto: InstitutionInviteLecturerDto,
  ): Promise<{ message: string; requestId: string }> {
    const [institution] = await this.db.db
      .select()
      .from(institutions)
      .where(eq(institutions.adminUserId, session.user.id));

    if (!institution) {
      throw new ForbiddenException('Institution profile not found.');
    }

    // Resolve lecturer by public lecturerId
    const [lecturer] = await this.db.db
      .select()
      .from(lecturers)
      .where(eq(lecturers.lecturerId, dto.lecturerId));

    if (!lecturer) {
      throw new NotFoundException(`Lecturer "${dto.lecturerId}" not found.`);
    }

    if (lecturer.institutionConnection === 'verified') {
      throw new ConflictException(
        'This lecturer is already connected to an institution.',
      );
    }

    // Auto-connect shortcut — lecturer already declared or requested this institution.
    // Fires for both 'placeholder' (declared without credentials) and 'pending'
    // (submitted credentials, awaiting approval). In both cases the intent is clear
    // and the institution initiating confirms the match from their side.
    if (
      lecturer.institutionId === institution.id &&
      (lecturer.institutionConnection === 'placeholder' ||
        lecturer.institutionConnection === 'pending')
    ) {
      await this.establishConnection(lecturer.id, institution.id);

      return {
        message:
          'Auto-connected — lecturer already had this institution as a placeholder.',
        requestId: 'auto',
      };
    }

    // Block duplicate pending requests
    const [existing] = await this.db.db
      .select({ id: institutionLecturerRequests.id })
      .from(institutionLecturerRequests)
      .where(
        and(
          eq(institutionLecturerRequests.lecturerId, lecturer.id),
          eq(institutionLecturerRequests.institutionId, institution.id),
          eq(institutionLecturerRequests.status, 'pending'),
        ),
      );

    if (existing) {
      throw new ConflictException(
        'A pending request already exists for this lecturer.',
      );
    }

    const [request] = await this.db.db
      .insert(institutionLecturerRequests)
      .values({
        lecturerId: lecturer.id,
        institutionId: institution.id,
        initiator: 'institution',
      })
      .returning({ id: institutionLecturerRequests.id });

    // Email the lecturer
    const [lecturerUser] = await this.db.db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, lecturer.userId));

    if (lecturerUser) {
      await this.mail.sendLecturerConnectionInvite({
        to: lecturerUser.email,
        lecturerName: lecturerUser.name,
        institutionName: institution.name,
        requestId: request.id,
      });
    }

    return {
      message: 'Invite sent to lecturer.',
      requestId: request.id,
    };
  }

  // -------------------------------------------------------------------------
  // Lecturer accepts an institution-initiated invite
  // -------------------------------------------------------------------------

  async lecturerAcceptInvite(
    requestId: string,
    session: ScholaidSession,
  ): Promise<{ message: string }> {
    const [lecturer] = await this.db.db
      .select()
      .from(lecturers)
      .where(eq(lecturers.userId, session.user.id));

    if (!lecturer) throw new ForbiddenException('Lecturer profile not found.');

    const [request] = await this.db.db
      .select()
      .from(institutionLecturerRequests)
      .where(
        and(
          eq(institutionLecturerRequests.id, requestId),
          eq(institutionLecturerRequests.lecturerId, lecturer.id),
          eq(institutionLecturerRequests.initiator, 'institution'),
          eq(institutionLecturerRequests.status, 'pending'),
        ),
      );

    if (!request) {
      throw new NotFoundException('Pending institution invite not found.');
    }

    if (lecturer.institutionConnection === 'verified') {
      throw new ConflictException(
        'You are already connected to an institution.',
      );
    }

    await this.establishConnection(lecturer.id, request.institutionId);

    await this.db.db
      .update(institutionLecturerRequests)
      .set({ status: 'approved', resolvedAt: new Date() })
      .where(eq(institutionLecturerRequests.id, requestId));

    return { message: 'Connection established.' };
  }

  // -------------------------------------------------------------------------
  // Institution removes a lecturer (forced — lecturer suspended)
  // -------------------------------------------------------------------------

  async removeLecturer(
    lecturerPublicId: string,
    session: ScholaidSession,
  ): Promise<{ message: string }> {
    const [institution] = await this.db.db
      .select()
      .from(institutions)
      .where(eq(institutions.adminUserId, session.user.id));

    if (!institution) {
      throw new ForbiddenException('Institution profile not found.');
    }

    const [lecturer] = await this.db.db
      .select()
      .from(lecturers)
      .where(
        and(
          eq(lecturers.lecturerId, lecturerPublicId),
          eq(lecturers.institutionId, institution.id),
          eq(lecturers.institutionConnection, 'verified'),
        ),
      );

    if (!lecturer) {
      throw new NotFoundException(
        'Verified lecturer not found under this institution.',
      );
    }

    // Suspend the lecturer and clear institution link
    await this.db.db
      .update(lecturers)
      .set({
        status: 'suspended',
        institutionId: null,
        institutionConnection: null,
        updatedAt: new Date(),
      })
      .where(eq(lecturers.id, lecturer.id));

    // Find students enrolled exclusively under this lecturer at this institution
    await this.unlinkExclusiveStudents(lecturer.id, institution.id);

    return { message: 'Lecturer removed and suspended.' };
  }

  // -------------------------------------------------------------------------
  // Lecturer voluntarily leaves their institution
  // -------------------------------------------------------------------------

  async lecturerLeave(session: ScholaidSession): Promise<{ message: string }> {
    const [lecturer] = await this.db.db
      .select()
      .from(lecturers)
      .where(eq(lecturers.userId, session.user.id));

    if (!lecturer) throw new ForbiddenException('Lecturer profile not found.');

    if (lecturer.institutionConnection !== 'verified') {
      throw new BadRequestException(
        'You are not currently connected to an institution.',
      );
    }

    const institutionId = lecturer.institutionId!;

    // Revert to standalone — keep status based on whether they have students
    const [enrolmentCount] = await this.db.db
      .select({ count: studentLecturers.id })
      .from(studentLecturers)
      .where(eq(studentLecturers.lecturerId, lecturer.id));

    const newStatus = enrolmentCount
      ? 'standalone_active'
      : 'standalone_no_students';

    await this.db.db
      .update(lecturers)
      .set({
        status: newStatus,
        institutionId: null,
        institutionConnection: null,
        updatedAt: new Date(),
      })
      .where(eq(lecturers.id, lecturer.id));

    // Unlink exclusively-covered students
    await this.unlinkExclusiveStudents(lecturer.id, institutionId);

    return {
      message: 'You have left the institution. Account reverted to standalone.',
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Establishes a verified connection between a lecturer and an institution.
   * Updates the lecturer row and marks institution as active_domain if needed.
   */
  private async establishConnection(
    lecturerId: string,
    institutionId: string,
  ): Promise<void> {
    await this.db.db
      .update(lecturers)
      .set({
        institutionId,
        institutionConnection: 'verified',
        status: 'institution_verified',
        updatedAt: new Date(),
      })
      .where(eq(lecturers.id, lecturerId));

    await this.db.db
      .update(institutions)
      .set({ status: 'active_domain', updatedAt: new Date() })
      .where(eq(institutions.id, institutionId));
  }

  /**
   * Finds students who are enrolled under `lecturerId` but have NO other
   * lecturer covering them at `institutionId`, then unlinks them from the
   * institution and sends each a notification email.
   */
  private async unlinkExclusiveStudents(
    lecturerId: string,
    institutionId: string,
  ): Promise<void> {
    // All students under this lecturer
    const enrolments = await this.db.db
      .select({ studentId: studentLecturers.studentId })
      .from(studentLecturers)
      .where(eq(studentLecturers.lecturerId, lecturerId));

    if (!enrolments.length) return;

    const studentIds = enrolments.map((e) => e.studentId);

    // For each student, check if any OTHER verified lecturer at this institution
    // also covers them
    const otherCoveredIds: string[] = [];

    for (const studentId of studentIds) {
      const [otherLecturer] = await this.db.db
        .select({ id: studentLecturers.id })
        .from(studentLecturers)
        .innerJoin(lecturers, eq(studentLecturers.lecturerId, lecturers.id))
        .where(
          and(
            eq(studentLecturers.studentId, studentId),
            eq(lecturers.institutionId, institutionId),
            eq(lecturers.institutionConnection, 'verified'),
          ),
        );

      if (otherLecturer) {
        otherCoveredIds.push(studentId);
      }
    }

    // Exclusively covered = enrolled under this lecturer and no other covers them
    const exclusiveIds = studentIds.filter(
      (id) => !otherCoveredIds.includes(id),
    );

    if (!exclusiveIds.length) return;

    // Get institution + lecturer name for email
    const [institutionRow] = await this.db.db
      .select({ name: institutions.name })
      .from(institutions)
      .where(eq(institutions.id, institutionId));

    const [lecturerRow] = await this.db.db
      .select({ name: user.name })
      .from(lecturers)
      .innerJoin(user, eq(lecturers.userId, user.id))
      .where(eq(lecturers.id, lecturerId));

    // Remove institution membership and notify each student
    for (const studentId of exclusiveIds) {
      await this.db.db
        .delete(studentInstitutions)
        .where(
          and(
            eq(studentInstitutions.studentId, studentId),
            eq(studentInstitutions.institutionId, institutionId),
          ),
        );

      // Get student email for notification
      const [studentUser] = await this.db.db
        .select({ email: user.email, name: user.name })
        .from(students)
        .innerJoin(user, eq(students.userId, user.id))
        .where(eq(students.id, studentId));

      if (studentUser && institutionRow && lecturerRow) {
        await this.mail.sendStudentUnlinkedNotification({
          to: studentUser.email,
          studentName: studentUser.name,
          institutionName: institutionRow.name,
          lecturerName: lecturerRow.name,
        });
      }
    }
  }
}
