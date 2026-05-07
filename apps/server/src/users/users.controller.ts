import { Controller, Get } from '@nestjs/common';
import { Session, AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth';
import { ScholaidRoles, type ScholaidSession } from '@/auth';

/**
 * UsersController demonstrates every layer of the protected route system.
 *
 * Default: all routes require authentication (global AuthGuard).
 *
 * Layers in order of execution:
 *   1. GlobalAuthGuard     — is there a valid session? (better-auth)
 *   2. ScholaidRoleGuard   — does the user have the right scholaidRole?
 *   3. @Roles()            — is the user a system admin? (admin plugin)
 */
@Controller('users')
export class UsersController {
  // -------------------------------------------------------------------------
  // Public — no auth needed
  // -------------------------------------------------------------------------

  @Get('health')
  @AllowAnonymous()
  health() {
    return { status: 'ok' };
  }

  // -------------------------------------------------------------------------
  // Authenticated — any signed-in user regardless of scholaidRole
  // -------------------------------------------------------------------------

  /**
   * Returns the full session for the current user.
   * Useful for the frontend to know who is logged in and what type they are.
   */
  @Get('me')
  getMe(@Session() session: ScholaidSession) {
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      scholaidRole: session.user.scholaidRole,
      institutionName: session.user.institutionName ?? null,
    };
  }

  // -------------------------------------------------------------------------
  // Role-gated — scholaidRole must match
  // -------------------------------------------------------------------------

  @Get('student/dashboard')
  @ScholaidRoles('student')
  getStudentDashboard(@Session() session: ScholaidSession) {
    return {
      message: 'Student dashboard',
      studentId: session.user.id,
      type: session.user.scholaidRole,
    };
  }

  @Get('lecturer/dashboard')
  @ScholaidRoles('lecturer')
  getLecturerDashboard(@Session() session: ScholaidSession) {
    return {
      message: 'Lecturer dashboard',
      lecturerId: session.user.id,
    };
  }

  @Get('institution/dashboard')
  @ScholaidRoles('institution')
  getInstitutionDashboard(@Session() session: ScholaidSession) {
    return {
      message: 'Institution dashboard',
      adminId: session.user.id,
      institutionName: session.user.institutionName,
    };
  }

  /**
   * Lecturers and institution admins can both access this.
   * Demonstrates multi-role gating.
   */
  @Get('reports')
  @ScholaidRoles('lecturer', 'institution')
  getReports(@Session() session: ScholaidSession) {
    return {
      message: 'Reports — accessible by lecturers and institutions',
      accessedBy: session.user.scholaidRole,
    };
  }

  // -------------------------------------------------------------------------
  // System admin only — uses the admin plugin's `role` field, not scholaidRole
  // -------------------------------------------------------------------------

  @Get('admin/users')
  @Roles(['admin'])
  getAdminUserList() {
    return {
      message: 'System admin only — use /api/auth/admin/* for full admin API',
    };
  }
}
