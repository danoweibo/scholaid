import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCHOLAID_ROLES_KEY } from '@/auth/decorators/scholaid-role.decorator';
import type { ScholaidRole } from '@/auth/types/session.types';

/**
 * Enforces @ScholaidRoles() on routes and controllers.
 *
 * IMPORTANT: This guard runs AFTER the global AuthGuard from
 * @thallesp/nestjs-better-auth, which means `request.session` is already
 * populated by the time this guard executes. Never use this guard alone on
 * a route — the global AuthGuard handles the authentication check.
 *
 * If a route has no @ScholaidRoles() decorator, this guard is a no-op and
 * the request passes through (any authenticated user may access it).
 *
 * Register this guard in AuthNestModule (provided globally) so it applies
 * across all feature modules without re-importing.
 *
 * Hierarchy:
 *   GlobalAuthGuard (better-auth)   → is the user logged in?
 *   ScholaidRoleGuard (this)        → is the user the right entity type?
 *   @Roles(['admin']) (wrapper)     → is the user a system operator?
 */
@Injectable()
export class ScholaidRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read the required roles from the decorator — check method first, then class
    const requiredRoles = this.reflector.getAllAndOverride<ScholaidRole[]>(
      SCHOLAID_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @ScholaidRoles() on this route — allow through
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // `session` is attached to the request by the global AuthGuard
    const request = context.switchToHttp().getRequest<{
      session?: { user?: { scholaidRole?: string } };
    }>();

    const scholaidRole = request.session?.user?.scholaidRole;

    if (!scholaidRole) {
      throw new ForbiddenException('No Scholaid role found on session.');
    }

    const hasRole = requiredRoles.includes(scholaidRole as ScholaidRole);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access restricted to: ${requiredRoles.join(', ')}. Your role: ${scholaidRole}.`,
      );
    }

    return true;
  }
}
