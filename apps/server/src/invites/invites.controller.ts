import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import {
  Session,
  AllowAnonymous,
  OptionalAuth,
} from '@thallesp/nestjs-better-auth';
import { ScholaidRoles } from '@/auth/decorators/scholaid-role.decorator';
import type { ScholaidSession } from '@/auth/types/session.types';
import { InvitesService, DispatchInviteDto } from '@/invites/invites.service';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  /**
   * POST /invites
   * Lecturer dispatches an invite.
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
   * Public — inspect invite status before accepting.
   */
  @Get(':token')
  @AllowAnonymous()
  inspect(@Param('token') token: string) {
    return this.invitesService.inspect(token);
  }

  /**
   * POST /invites/:token/accept
   * Accept an invite by token.
   * OptionalAuth — works for both authenticated students and anonymous users.
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
   * POST /invites/:token/revoke
   * Lecturer revokes a pending invite by token.
   */
  @Post(':token/revoke')
  @ScholaidRoles('lecturer')
  revoke(@Param('token') token: string, @Session() session: ScholaidSession) {
    return this.invitesService.revokeByToken(token, session);
  }
}
