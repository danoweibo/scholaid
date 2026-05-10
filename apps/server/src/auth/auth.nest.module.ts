import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { ScholaidRoleGuard } from '@/auth/guards/scholaid-role.guard';
import { CbtAccessGuard } from '@/auth/guards/cbt-access.guard';
import { DBModule } from '@/db/db.module';
import { auth } from '@/auth/auth';

/**
 * AuthNestModule wires up Scholaid's auth layer globally:
 *
 *  - AuthService        → type-safe access to better-auth API methods
 *  - ScholaidRoleGuard  → enforces @ScholaidRoles() on all routes
 *  - CbtAccessGuard     → enforces @StandardStudentOnly() on CBT routes
 *
 * Guard execution order (after the better-auth global AuthGuard):
 *   1. ScholaidRoleGuard  — checks scholaidRole
 *   2. CbtAccessGuard     — checks student.type === 'standard'
 *
 * Import once in AppModule. @Global() makes AuthService available everywhere.
 */
@Global()
@Module({
  imports: [DBModule],
  providers: [
    {
      provide: AuthService,
      useValue: new AuthService({ auth }),
    },
    {
      provide: APP_GUARD,
      useClass: ScholaidRoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CbtAccessGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthNestModule {}
