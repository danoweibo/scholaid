import type { User } from 'better-auth';
import { db } from '@/db';
import { students, lecturers, institutions } from '@/db/schema';
import { generatePublicId } from '@/lib/utils/id';

// Extend better-auth's core User type with our additionalFields.
// `role` and `institutionName` are declared in auth.ts under user.additionalFields
// and are persisted to the `user` table, so they are present on this object.
type ScholaidUser = User & {
  role?: string;
  institutionName?: string;
};

/**
 * Fires immediately after better-auth commits a new `user` row.
 * Creates the matching domain profile (students / lecturers / institutions)
 * based on the `role` field submitted in the sign-up body.
 *
 * Registered in auth.ts → databaseHooks.user.create.after.
 *
 * Important: do NOT throw here — an unhandled throw would not roll back the
 * already-committed `user` row, it would just leave the user without a domain
 * profile. Log + warn instead and let the operator investigate.
 */
export async function createUserProfileHook(user: ScholaidUser): Promise<void> {
  const { id, role, institutionName } = user;

  switch (role) {
    case 'student':
      await db.insert(students).values({
        userId: id,
        studentId: await generatePublicId('STU'),
        type: 'enthusiast', // upgraded to 'standard' when a lecturer invite is accepted
      });
      break;

    case 'lecturer':
      await db.insert(lecturers).values({
        userId: id,
        lecturerId: await generatePublicId('LEC'),
        status: 'standalone_no_students',
      });
      break;

    case 'institution':
      await db.insert(institutions).values({
        adminUserId: id,
        institutionId: await generatePublicId('INST'),
        name: institutionName ?? 'Unnamed Institution',
        status: 'operational',
      });
      break;

    default:
      console.warn(
        `[createUserProfileHook] Unknown role "${String(role)}" for user ${id}. No domain profile created.`,
      );
  }
}
