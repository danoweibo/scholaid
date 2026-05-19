CREATE TYPE "public"."connection_request_initiator" AS ENUM('lecturer', 'institution');--> statement-breakpoint
CREATE TYPE "public"."connection_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "institution_lecturer_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lecturer_id" uuid NOT NULL,
	"institution_id" uuid NOT NULL,
	"initiator" "connection_request_initiator" NOT NULL,
	"status" "connection_request_status" DEFAULT 'pending' NOT NULL,
	"staff_email_domain" text,
	"employee_id" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "institution_lecturer_requests" ADD CONSTRAINT "institution_lecturer_requests_lecturer_id_lecturers_id_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."lecturers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institution_lecturer_requests" ADD CONSTRAINT "institution_lecturer_requests_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;