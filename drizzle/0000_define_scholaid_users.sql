CREATE TYPE "public"."institution_status" AS ENUM('operational', 'active_domain');
CREATE TYPE "public"."invite_status" AS ENUM('pending', 'accepted', 'expired', 'revoked');
CREATE TYPE "public"."lecturer_institution_connection" AS ENUM('placeholder', 'pending', 'verified');
CREATE TYPE "public"."lecturer_status" AS ENUM('standalone_no_students', 'standalone_active', 'institution_pending', 'institution_verified', 'suspended');
CREATE TYPE "public"."matric_verification_mode" AS ENUM('programmatic', 'manual');
CREATE TYPE "public"."matric_verification_status" AS ENUM('pending', 'approved', 'rejected');
CREATE TYPE "public"."student_institution_status" AS ENUM('pending', 'full');
CREATE TYPE "public"."student_type" AS ENUM('enthusiast', 'standard');
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "institutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution_id" text NOT NULL,
	"name" text NOT NULL,
	"admin_user_id" text NOT NULL,
	"status" "institution_status" DEFAULT 'operational' NOT NULL,
	"matric_verification_mode" "matric_verification_mode" DEFAULT 'manual' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "institutions_institution_id_unique" UNIQUE("institution_id"),
	CONSTRAINT "institutions_admin_user_id_unique" UNIQUE("admin_user_id")
);

CREATE TABLE "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"lecturer_id" uuid NOT NULL,
	"invitee_email" text,
	"invitee_student_id" text,
	"status" "invite_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invites_token_unique" UNIQUE("token")
);

CREATE TABLE "lecturers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lecturer_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "lecturer_status" DEFAULT 'standalone_no_students' NOT NULL,
	"institution_id" uuid,
	"institution_connection" "lecturer_institution_connection",
	"staff_email_domain" text,
	"employee_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lecturers_lecturer_id_unique" UNIQUE("lecturer_id"),
	CONSTRAINT "lecturers_user_id_unique" UNIQUE("user_id")
);

CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);

CREATE TABLE "student_institutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"institution_id" uuid NOT NULL,
	"status" "student_institution_status" DEFAULT 'pending' NOT NULL,
	"matric_number" text,
	"matric_verification_status" "matric_verification_status" DEFAULT 'pending' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"verified_at" timestamp
);

CREATE TABLE "student_lecturers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"lecturer_id" uuid NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" "student_type" DEFAULT 'enthusiast' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id"),
	CONSTRAINT "students_user_id_unique" UNIQUE("user_id")
);

CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'student' NOT NULL,
	"institution_name" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);

CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_admin_user_id_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "invites" ADD CONSTRAINT "invites_lecturer_id_lecturers_id_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."lecturers"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "student_institutions" ADD CONSTRAINT "student_institutions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "student_institutions" ADD CONSTRAINT "student_institutions_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "student_lecturers" ADD CONSTRAINT "student_lecturers_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "student_lecturers" ADD CONSTRAINT "student_lecturers_lecturer_id_lecturers_id_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."lecturers"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;