ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false NOT NULL;
ALTER TABLE "user" ADD COLUMN "ban_reason" text;
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;