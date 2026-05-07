ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "scholaid_role" text DEFAULT 'student' NOT NULL;