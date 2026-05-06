import { db } from '@/db';
import { students, lecturers, institutions } from '@/db/schema';
import { count } from 'drizzle-orm';

const TABLE_MAP = {
  STU: students,
  LEC: lecturers,
  INST: institutions,
} as const;

type Prefix = keyof typeof TABLE_MAP;

/**
 * Generates a sequential public-facing ID like "STU-00042".
 * Uses the current row count so IDs are always monotonically increasing.
 * Not guaranteed gap-free (deletes leave gaps) but human-readable and unique.
 */
export async function generatePublicId(prefix: Prefix): Promise<string> {
  const table = TABLE_MAP[prefix];
  const [result] = await db.select({ value: count() }).from(table);
  const next = (result?.value ?? 0) + 1;
  return `${prefix}-${String(next).padStart(5, '0')}`;
}
