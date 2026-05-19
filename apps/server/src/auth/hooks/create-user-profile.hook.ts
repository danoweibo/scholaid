import type { User } from 'better-auth';
import { db } from '@/db/index';
import { students, lecturers, institutions } from '@/db/schema';
import { generatePublicId } from '@/lib/utils/id';

type ScholaidUser = User & {
  scholaidRole?: string;
  institutionName?: string;
};

export async function createUserProfileHook(user: ScholaidUser): Promise<void> {
  const { id, scholaidRole, institutionName } = user;

  switch (scholaidRole) {
    case 'student':
      await db.insert(students).values({
        userId: id,
        studentId: await generatePublicId('STU'),
        type: 'enthusiast',
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
        `[createUserProfileHook] Unknown scholaidRole "${String(scholaidRole)}" for user ${id}.`,
      );
  }
}
