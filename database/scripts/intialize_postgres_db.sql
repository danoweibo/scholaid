-- =============================================================================
-- ScholAid — Consolidated Supabase Migration
-- Combines: 0000_define_scholaid_users, 0001_config_auth_roles,
--           0002_better_auth_fields, 0003_institution_requests_store
-- RLS: DISABLED
-- =============================================================================


-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------

CREATE TYPE "public"."institution_status"
  AS ENUM('operational', 'active_domain');

CREATE TYPE "public"."invite_status"
  AS ENUM('pending', 'accepted', 'expired', 'revoked');

CREATE TYPE "public"."lecturer_institution_connection"
  AS ENUM('placeholder', 'pending', 'verified');

CREATE TYPE "public"."lecturer_status"
  AS ENUM(
    'standalone_no_students',
    'standalone_active',
    'institution_pending',
    'institution_verified',
    'suspended'
  );

CREATE TYPE "public"."matric_verification_mode"
  AS ENUM('programmatic', 'manual');

CREATE TYPE "public"."matric_verification_status"
  AS ENUM('pending', 'approved', 'rejected');

CREATE TYPE "public"."student_institution_status"
  AS ENUM('pending', 'full');

CREATE TYPE "public"."student_type"
  AS ENUM('enthusiast', 'standard');

-- Added in migration 0003
CREATE TYPE "public"."connection_request_initiator"
  AS ENUM('lecturer', 'institution');

CREATE TYPE "public"."connection_request_status"
  AS ENUM('pending', 'approved', 'rejected', 'cancelled');


-- -----------------------------------------------------------------------------
-- CORE AUTH TABLES (Better Auth)
-- -----------------------------------------------------------------------------

CREATE TABLE "user" (
  "id"               text        PRIMARY KEY NOT NULL,
  "name"             text        NOT NULL,
  "email"            text        NOT NULL,
  "email_verified"   boolean     DEFAULT false NOT NULL,
  "image"            text,
  "created_at"       timestamp   DEFAULT now() NOT NULL,
  "updated_at"       timestamp   DEFAULT now() NOT NULL,

  -- 0001: role column; Better Auth's own role field uses 'user' as default
  "role"             text        DEFAULT 'user' NOT NULL,

  -- 0001: ScholAid-specific role (student | lecturer | institution_admin | etc.)
  "scholaid_role"    text        DEFAULT 'student' NOT NULL,

  -- Legacy field kept from migration 0000 (institution admin onboarding flow)
  "institution_name" text,

  -- 0002: Ban fields (Better Auth admin plugin)
  "banned"           boolean     DEFAULT false NOT NULL,
  "ban_reason"       text,
  "ban_expires"      timestamp,

  CONSTRAINT "user_email_unique" UNIQUE("email")
);

CREATE TABLE "session" (
  "id"          text        PRIMARY KEY NOT NULL,
  "expires_at"  timestamp   NOT NULL,
  "token"       text        NOT NULL,
  "created_at"  timestamp   DEFAULT now() NOT NULL,
  "updated_at"  timestamp   DEFAULT now() NOT NULL,
  "ip_address"  text,
  "user_agent"  text,
  "user_id"     text        NOT NULL,

  CONSTRAINT "session_token_unique" UNIQUE("token"),
  CONSTRAINT "session_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE
);

CREATE TABLE "account" (
  "id"                       text        PRIMARY KEY NOT NULL,
  "account_id"               text        NOT NULL,
  "provider_id"              text        NOT NULL,
  "user_id"                  text        NOT NULL,
  "access_token"             text,
  "refresh_token"            text,
  "id_token"                 text,
  "access_token_expires_at"  timestamp,
  "refresh_token_expires_at" timestamp,
  "scope"                    text,
  "password"                 text,
  "created_at"               timestamp   DEFAULT now() NOT NULL,
  "updated_at"               timestamp   DEFAULT now() NOT NULL,

  CONSTRAINT "account_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE
);

CREATE TABLE "verification" (
  "id"          text        PRIMARY KEY NOT NULL,
  "identifier"  text        NOT NULL,
  "value"       text        NOT NULL,
  "expires_at"  timestamp   NOT NULL,
  "created_at"  timestamp   DEFAULT now(),
  "updated_at"  timestamp   DEFAULT now()
);


-- -----------------------------------------------------------------------------
-- DOMAIN TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE "institutions" (
  "id"                       uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "institution_id"           text        NOT NULL,
  "name"                     text        NOT NULL,
  "admin_user_id"            text        NOT NULL,
  "status"                   "institution_status"       DEFAULT 'operational' NOT NULL,
  "matric_verification_mode" "matric_verification_mode" DEFAULT 'manual'      NOT NULL,
  "created_at"               timestamp   DEFAULT now() NOT NULL,
  "updated_at"               timestamp   DEFAULT now() NOT NULL,

  CONSTRAINT "institutions_institution_id_unique" UNIQUE("institution_id"),
  CONSTRAINT "institutions_admin_user_id_unique"  UNIQUE("admin_user_id"),
  CONSTRAINT "institutions_admin_user_id_user_id_fk"
    FOREIGN KEY ("admin_user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT
);

CREATE TABLE "lecturers" (
  "id"                      uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lecturer_id"             text        NOT NULL,
  "user_id"                 text        NOT NULL,
  "status"                  "lecturer_status"               DEFAULT 'standalone_no_students' NOT NULL,
  "institution_id"          uuid,
  "institution_connection"  "lecturer_institution_connection",
  "staff_email_domain"      text,
  "employee_id"             text,
  "created_at"              timestamp   DEFAULT now() NOT NULL,
  "updated_at"              timestamp   DEFAULT now() NOT NULL,

  CONSTRAINT "lecturers_lecturer_id_unique" UNIQUE("lecturer_id"),
  CONSTRAINT "lecturers_user_id_unique"     UNIQUE("user_id"),
  CONSTRAINT "lecturers_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE,
  CONSTRAINT "lecturers_institution_id_institutions_id_fk"
    FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE SET NULL
);

CREATE TABLE "students" (
  "id"          uuid          PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "student_id"  text          NOT NULL,
  "user_id"     text          NOT NULL,
  "type"        "student_type" DEFAULT 'enthusiast' NOT NULL,
  "created_at"  timestamp     DEFAULT now() NOT NULL,
  "updated_at"  timestamp     DEFAULT now() NOT NULL,

  CONSTRAINT "students_student_id_unique" UNIQUE("student_id"),
  CONSTRAINT "students_user_id_unique"    UNIQUE("user_id"),
  CONSTRAINT "students_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE
);

CREATE TABLE "invites" (
  "id"                uuid          PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "token"             text          NOT NULL,
  "lecturer_id"       uuid          NOT NULL,
  "invitee_email"     text,
  "invitee_student_id" text,
  "status"            "invite_status" DEFAULT 'pending' NOT NULL,
  "expires_at"        timestamp     NOT NULL,
  "accepted_at"       timestamp,
  "created_at"        timestamp     DEFAULT now() NOT NULL,

  CONSTRAINT "invites_token_unique" UNIQUE("token"),
  CONSTRAINT "invites_lecturer_id_lecturers_id_fk"
    FOREIGN KEY ("lecturer_id") REFERENCES "public"."lecturers"("id") ON DELETE CASCADE
);

CREATE TABLE "student_institutions" (
  "id"                        uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "student_id"                uuid        NOT NULL,
  "institution_id"            uuid        NOT NULL,
  "status"                    "student_institution_status"  DEFAULT 'pending'  NOT NULL,
  "matric_number"             text,
  "matric_verification_status" "matric_verification_status" DEFAULT 'pending' NOT NULL,
  "joined_at"                 timestamp   DEFAULT now() NOT NULL,
  "verified_at"               timestamp,

  CONSTRAINT "student_institutions_student_id_students_id_fk"
    FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE,
  CONSTRAINT "student_institutions_institution_id_institutions_id_fk"
    FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE
);

CREATE TABLE "student_lecturers" (
  "id"          uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "student_id"  uuid        NOT NULL,
  "lecturer_id" uuid        NOT NULL,
  "enrolled_at" timestamp   DEFAULT now() NOT NULL,

  CONSTRAINT "student_lecturers_student_id_students_id_fk"
    FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE,
  CONSTRAINT "student_lecturers_lecturer_id_lecturers_id_fk"
    FOREIGN KEY ("lecturer_id") REFERENCES "public"."lecturers"("id") ON DELETE CASCADE
);


-- -----------------------------------------------------------------------------
-- MIGRATION 0003 — Institution ↔ Lecturer connection requests
-- -----------------------------------------------------------------------------

CREATE TABLE "institution_lecturer_requests" (
  "id"                  uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lecturer_id"         uuid        NOT NULL,
  "institution_id"      uuid        NOT NULL,
  "initiator"           "connection_request_initiator" NOT NULL,
  "status"              "connection_request_status"    DEFAULT 'pending' NOT NULL,
  "staff_email_domain"  text,
  "employee_id"         text,
  "resolved_at"         timestamp,
  "created_at"          timestamp   DEFAULT now() NOT NULL,

  CONSTRAINT "institution_lecturer_requests_lecturer_id_lecturers_id_fk"
    FOREIGN KEY ("lecturer_id") REFERENCES "public"."lecturers"("id") ON DELETE CASCADE,
  CONSTRAINT "institution_lecturer_requests_institution_id_institutions_id_fk"
    FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE
);