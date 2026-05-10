import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { eq } from 'drizzle-orm';
import { CBT_ACCESS_KEY } from '@/auth/decorators/standard-student.decorator';
import { DBService } from '@/db/db.service';
import { students } from '@/db/schema';

/**
 * Enforces @StandardStudentOnly() on routes and controllers.
 *
 * Runs AFTER the global AuthGuard and ScholaidRoleGuard, so by the time
 * this guard executes we already know:
 *   - The user is authenticated
 *   - The user's scholaidRole is 'student'
 *
 * This guard then checks the `students` table to confirm the student's
 * type is 'standard'. Enthusiast students receive a 403 with a clear
 * message directing them to accept a lecturer invite.
 *
 * If the route has no @StandardStudentOnly() decorator, this guard is a no-op.
 */
@Injectable()
export class CbtAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly db: DBService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresStandard = this.reflector.getAllAndOverride<boolean>(
      CBT_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @StandardStudentOnly() — pass through
    if (!requiresStandard) return true;

    const request = context.switchToHttp().getRequest<{
      session?: { user?: { id?: string } };
    }>();

    const userId = request.session?.user?.id;

    if (!userId) {
      throw new ForbiddenException('No session found.');
    }

    const [student] = await this.db.db
      .select({ type: students.type })
      .from(students)
      .where(eq(students.userId, userId));

    if (!student) {
      throw new ForbiddenException('Student profile not found.');
    }

    if (student.type !== 'standard') {
      throw new ForbiddenException(
        'CBT access requires a standard student account. Accept a lecturer invite to upgrade your account.',
      );
    }

    return true;
  }
}
