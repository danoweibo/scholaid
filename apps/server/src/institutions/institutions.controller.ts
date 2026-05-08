/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Post, Body, Param } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import { ScholaidRoles } from '@/auth/decorators/scholaid-role.decorator';
import type { ScholaidSession } from '@/auth/types/session.types';
import {
  InstitutionsService,
  LecturerConnectDto,
  InstitutionInviteLecturerDto,
} from '@/institutions/institutions.service';

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  // -------------------------------------------------------------------------
  // Lecturer-initiated flows
  // -------------------------------------------------------------------------

  /**
   * POST /institutions/connect
   * Lecturer submits staff email domain + employee ID to request a connection.
   */
  @Post('connect')
  @ScholaidRoles('lecturer')
  lecturerConnect(
    @Session() session: ScholaidSession,
    @Body() body: LecturerConnectDto,
  ) {
    return this.institutionsService.lecturerConnect(session, body);
  }

  /**
   * POST /institutions/requests/:requestId/accept
   * Lecturer accepts an institution-initiated connection invite.
   */
  @Post('requests/:requestId/accept')
  @ScholaidRoles('lecturer')
  lecturerAcceptInvite(
    @Param('requestId') requestId: string,
    @Session() session: ScholaidSession,
  ) {
    return this.institutionsService.lecturerAcceptInvite(requestId, session);
  }

  /**
   * POST /institutions/leave
   * Lecturer voluntarily leaves their current institution.
   */
  @Post('leave')
  @ScholaidRoles('lecturer')
  lecturerLeave(@Session() session: ScholaidSession) {
    return this.institutionsService.lecturerLeave(session);
  }

  // -------------------------------------------------------------------------
  // Institution-initiated flows
  // -------------------------------------------------------------------------

  /**
   * POST /institutions/lecturers/invite
   * Institution invites a lecturer to connect by their public lecturerId.
   */
  @Post('lecturers/invite')
  @ScholaidRoles('institution')
  institutionInviteLecturer(
    @Session() session: ScholaidSession,
    @Body() body: InstitutionInviteLecturerDto,
  ) {
    return this.institutionsService.institutionInviteLecturer(session, body);
  }

  /**
   * POST /institutions/requests/:requestId/approve
   * Institution approves a lecturer-initiated connection request.
   */
  @Post('requests/:requestId/approve')
  @ScholaidRoles('institution')
  approveRequest(
    @Param('requestId') requestId: string,
    @Session() session: ScholaidSession,
  ) {
    return this.institutionsService.approveRequest(requestId, session);
  }

  /**
   * POST /institutions/lecturers/:lecturerId/remove
   * Institution forcibly removes a lecturer — lecturer is suspended.
   */
  @Post('lecturers/:lecturerId/remove')
  @ScholaidRoles('institution')
  removeLecturer(
    @Param('lecturerId') lecturerId: string,
    @Session() session: ScholaidSession,
  ) {
    return this.institutionsService.removeLecturer(lecturerId, session);
  }
}
