import type { UserSession } from '@thallesp/nestjs-better-auth';

/**
 * The three entity types a Scholaid user can be.
 * Stored as `scholaidRole` on the better-auth `user` row (additionalFields).
 */
export type ScholaidRole = 'student' | 'lecturer' | 'institution';

/**
 * Extends the base better-auth UserSession with the Scholaid-specific fields
 * that are persisted to the `user` table via additionalFields in auth.ts.
 *
 * Use this type instead of the bare `UserSession` wherever you need to read
 * `scholaidRole` or `institutionName` from the session.
 *
 * Usage in a controller:
 *   @Get('me')
 *   getMe(@Session() session: ScholaidSession) {
 *     const { scholaidRole } = session.user;
 *   }
 */
export type ScholaidSession = UserSession & {
  user: UserSession['user'] & {
    scholaidRole: ScholaidRole;
    institutionName?: string;
  };
};
