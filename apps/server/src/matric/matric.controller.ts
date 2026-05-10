import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import { ScholaidRoles } from '@/auth/decorators/scholaid-role.decorator';
import type { ScholaidSession } from '@/auth/types/session.types';
import { MatricService, SubmitMatricDto } from '@/matric/matric.service';

@Controller('matric')
export class MatricController {
  constructor(private readonly matricService: MatricService) {}

  /**
   * POST /matric/submit
   * Student submits their matric number for an institution they're a pending member of.
   * Triggers programmatic verification immediately if the institution has opted in,
   * otherwise records the submission for manual review.
   */
  @Post('submit')
  @ScholaidRoles('student')
  submit(@Session() session: ScholaidSession, @Body() body: SubmitMatricDto) {
    return this.matricService.submit(session, body);
  }

  /**
   * GET /matric/pending
   * Institution admin views all pending matric submissions for their institution.
   */
  @Get('pending')
  @ScholaidRoles('institution')
  listPending(@Session() session: ScholaidSession) {
    return this.matricService.listPending(session);
  }

  /**
   * POST /matric/:membershipId/approve
   * Institution admin manually approves a matric submission.
   * Student becomes a full institution member.
   */
  @Post(':membershipId/approve')
  @ScholaidRoles('institution')
  approve(
    @Param('membershipId') membershipId: string,
    @Session() session: ScholaidSession,
  ) {
    return this.matricService.approve(membershipId, session);
  }

  /**
   * POST /matric/:membershipId/reject
   * Institution admin rejects a matric submission.
   */
  @Post(':membershipId/reject')
  @ScholaidRoles('institution')
  reject(
    @Param('membershipId') membershipId: string,
    @Session() session: ScholaidSession,
  ) {
    return this.matricService.reject(membershipId, session);
  }
}
