import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import {
  Session,
  AllowAnonymous,
  OptionalAuth,
} from '@thallesp/nestjs-better-auth';
import { ScholaidRoles } from '@/auth/decorators/scholaid-role.decorator';
import type { ScholaidSession } from '@/auth/types/session.types';
import {
  InvitesService,
  type DispatchInviteDto,
} from '@/invites/invites.service';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  /**
   * POST /invites
   * Lecturer dispatches an invite to a student by email or studentId.
   * Auth: lecturer only.
   */
  @Post()
  @ScholaidRoles('lecturer')
  dispatch(
    @Session() session: ScholaidSession,
    @Body() body: DispatchInviteDto,
  ) {
    return this.invitesService.dispatch(session, body);
  }

  /**
   * GET /invites/:token
   * Public — frontend calls this when the student clicks the invite link
   * to know the status and who sent it before showing the accept screen.
   */
  @Get(':token')
  @AllowAnonymous()
  inspect(@Param('token') token: string) {
    return this.invitesService.inspect(token);
  }

  /**
   * POST /invites/:token/accept
   * Accepts an invite. Uses OptionalAuth because:
   *   - Authenticated student → enrol directly
   *   - No account → return NO_ACCOUNT signal so frontend redirects to register
   *
   * After registration, the frontend should call this endpoint again with
   * the student's new session to complete enrolment.
   */
  @Post(':token/accept')
  @OptionalAuth()
  accept(
    @Param('token') token: string,
    @Session() session: ScholaidSession | null,
  ) {
    return this.invitesService.accept(token, session?.user?.id ?? null);
  }

  /**
   * PATCH /invites/:id/revoke
   * Lecturer cancels a pending invite they sent.
   * Auth: lecturer only.
   */
  @Patch(':id/revoke')
  @ScholaidRoles('lecturer')
  revoke(@Param('id') inviteId: string, @Session() session: ScholaidSession) {
    return this.invitesService.revoke(inviteId, session);
  }
}
