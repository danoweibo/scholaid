import { Controller, Get } from '@nestjs/common';
import { Session, AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ScholaidRoles } from '@/auth/decorators/scholaid-role.decorator';
import type { ScholaidSession } from '@/auth/types/session.types';

@Controller('users')
export class UsersController {
  // -------------------------------------------------------------------------
  // Public
  // -------------------------------------------------------------------------

  @Get('health')
  @AllowAnonymous()
  @SkipThrottle()
  health() {
    return { status: 'ok' };
  }

  // -------------------------------------------------------------------------
  // Authenticated — strict rate limit (session reads are lightweight but
  // frequent polling from a frontend should be cached, not hammered)
  // -------------------------------------------------------------------------

  @Get('me')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
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
  // Role-gated dashboards
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

  @Get('reports')
  @ScholaidRoles('lecturer', 'institution')
  getReports(@Session() session: ScholaidSession) {
    return {
      message: 'Reports — accessible by lecturers and institutions',
      accessedBy: session.user.scholaidRole,
    };
  }

  // -------------------------------------------------------------------------
  // System admin only
  // -------------------------------------------------------------------------

  @Get('admin/users')
  @Roles(['admin'])
  getAdminUserList() {
    return {
      message: 'System admin only — use /api/auth/admin/* for full admin API',
    };
  }
}
