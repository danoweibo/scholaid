import { db } from '@/db';
import { students, lecturers, institutions } from '@/db/schema';
import { generatePublicId } from '@/common/utils/id';

export const createUserProfileHook = async (ctx) => {
  const user = ctx.context?.newSession?.user;
  if (!user) return;

  const role = user.role as 'student' | 'lecturer' | 'institution';

  switch (role) {
    case 'student':
      await db.insert(students).values({
        userId: user.id,
        studentId: await generatePublicId('STU'),
        type: 'enthusiast', // default — upgraded later via invite
      });
      break;

    case 'lecturer':
      await db.insert(lecturers).values({
        userId: user.id,
        lecturerId: await generatePublicId('LEC'),
        status: 'standalone_no_students',
      });
      break;

    case 'institution':
      await db.insert(institutions).values({
        adminUserId: user.id,
        institutionId: await generatePublicId('INST'),
        name: ctx.body?.institutionName ?? 'Unnamed Institution',
        status: 'operational',
      });
      break;
  }
};
