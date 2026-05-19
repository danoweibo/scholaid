import { count } from "drizzle-orm";
import { db } from "@/database";
import { students, lecturers, institutions } from "@/database/schema";

const TABLE_MAP = {
  STU: students,
  LEC: lecturers,
  INST: institutions,
} as const;

type Prefix = keyof typeof TABLE_MAP;

export async function generatePublicId(prefix: Prefix): Promise<string> {
  const table = TABLE_MAP[prefix];
  const [result] = await db.select({ value: count() }).from(table);
  const next = (result?.value ?? 0) + 1;
  return `${prefix}-${String(next).padStart(5, "0")}`;
}
