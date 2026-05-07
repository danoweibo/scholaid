import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { ScholaidRoleGuard } from '@/auth/guards/scholaid-role.guard';
import { auth } from '@/auth/auth';

/**
 * AuthNestModule wires up Scholaid's auth layer:
 *
 *  - Provides AuthService<typeof auth> so any controller can call
 *    better-auth's API methods (e.g. admin actions, session management)
 *    without importing the raw `auth` object.
 *
 *  - Registers ScholaidRoleGuard as a global APP_GUARD so @ScholaidRoles()
 *    works across all feature modules without re-importing this module.
 *    It runs after the global AuthGuard from @thallesp/nestjs-better-auth.
 *
 * Import this module once in AppModule alongside AuthModule.forRoot().
 * Do NOT import it in feature modules — the @Global() decorator makes
 * everything it provides available app-wide.
 */
@Global()
@Module({
  providers: [
    // AuthService gives controllers type-safe access to better-auth's API
    {
      provide: AuthService,
      useValue: new AuthService(auth),
    },
    // ScholaidRoleGuard runs globally after the better-auth AuthGuard
    {
      provide: APP_GUARD,
      useClass: ScholaidRoleGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthNestModule {}
