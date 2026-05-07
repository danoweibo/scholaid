import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const studentTypeEnum = pgEnum('student_type', [
  'enthusiast',
  'standard',
]);

export const studentInstitutionStatusEnum = pgEnum(
  'student_institution_status',
  ['pending', 'full'],
);

export const lecturerStatusEnum = pgEnum('lecturer_status', [
  'standalone_no_students',
  'standalone_active',
  'institution_pending',
  'institution_verified',
  'suspended',
]);

export const lecturerInstitutionConnectionEnum = pgEnum(
  'lecturer_institution_connection',
  [
    'placeholder', // declared but unverified
    'pending', // verification submitted, awaiting institution approval
    'verified', // fully connected
  ],
);

export const institutionStatusEnum = pgEnum('institution_status', [
  'operational',
  'active_domain',
]);

export const inviteStatusEnum = pgEnum('invite_status', [
  'pending',
  'accepted',
  'expired',
  'revoked',
]);

export const matricVerificationModeEnum = pgEnum('matric_verification_mode', [
  'programmatic',
  'manual',
]);

export const matricVerificationStatusEnum = pgEnum(
  'matric_verification_status',
  ['pending', 'approved', 'rejected'],
);

// ---------------------------------------------------------------------------
// Better-Auth core tables
// Table names must be exactly: user, session, account, verification
// These are what the drizzle adapter expects when no custom schema mapping is set.
// ---------------------------------------------------------------------------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  // Owned by the better-auth admin plugin. Values: 'user' | 'admin'.
  // Do NOT use this for student/lecturer/institution — that is scholaidRole.
  role: text('role').notNull().default('user'),
  // Application-level entity type: 'student' | 'lecturer' | 'institution'
  // Named differently from `role` to avoid collision with the admin plugin.
  scholaidRole: text('scholaid_role').notNull().default('student'),
  // Only populated when scholaidRole === 'institution'
  institutionName: text('institution_name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ---------------------------------------------------------------------------
// Domain tables
// ---------------------------------------------------------------------------

/**
 * Students — one row per student user, linked 1-to-1 with a better-auth `user`.
 * `studentId` is the public-facing identifier (e.g. "STU-00042") issued at registration.
 */
export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: text('student_id').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: studentTypeEnum('type').notNull().default('enthusiast'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Lecturers — one row per lecturer user.
 * `institutionId` + `institutionConnection` track the current affiliation state.
 * Verification credentials are stored here when a connection request is submitted.
 */
export const lecturers = pgTable('lecturers', {
  id: uuid('id').primaryKey().defaultRandom(),
  lecturerId: text('lecturer_id').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  status: lecturerStatusEnum('status')
    .notNull()
    .default('standalone_no_students'),
  // Nullable until a connection is declared/established
  institutionId: uuid('institution_id').references(() => institutions.id, {
    onDelete: 'set null',
  }),
  institutionConnection: lecturerInstitutionConnectionEnum(
    'institution_connection',
  ),
  staffEmailDomain: text('staff_email_domain'),
  employeeId: text('employee_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Institutions — single super-admin model for MVP.
 * `adminUserId` points to the better-auth `user` row of the super-admin.
 */
export const institutions = pgTable('institutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: text('institution_id').notNull().unique(),
  name: text('name').notNull(),
  adminUserId: text('admin_user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'restrict' }),
  status: institutionStatusEnum('status').notNull().default('operational'),
  matricVerificationMode: matricVerificationModeEnum('matric_verification_mode')
    .notNull()
    .default('manual'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Student ↔ Lecturer enrolments (many-to-many).
 * A student can be enrolled under multiple lecturers from the same institution.
 */
export const studentLecturers = pgTable('student_lecturers', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  lecturerId: uuid('lecturer_id')
    .notNull()
    .references(() => lecturers.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
});

/**
 * Student ↔ Institution membership (many-to-many).
 * Propagated automatically when a student is enrolled under a verified lecturer.
 * Full membership requires matric verification.
 */
export const studentInstitutions = pgTable('student_institutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id, { onDelete: 'cascade' }),
  status: studentInstitutionStatusEnum('status').notNull().default('pending'),
  matricNumber: text('matric_number'),
  matricVerificationStatus: matricVerificationStatusEnum(
    'matric_verification_status',
  )
    .notNull()
    .default('pending'),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  verifiedAt: timestamp('verified_at'),
});

/**
 * Invites — dispatched by lecturers to enrol students.
 * Single-use, 72h TTL (enforced via `expiresAt` + `status`).
 * Either `inviteeEmail` or `inviteeStudentId` must be set (enforced at service layer).
 */
export const invites = pgTable('invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: text('token').notNull().unique(),
  lecturerId: uuid('lecturer_id')
    .notNull()
    .references(() => lecturers.id, { onDelete: 'cascade' }),
  inviteeEmail: text('invitee_email'),
  inviteeStudentId: text('invitee_student_id'),
  status: inviteStatusEnum('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations (Drizzle relational query API)
// ---------------------------------------------------------------------------

export const userRelations = relations(user, ({ one }) => ({
  student: one(students, { fields: [user.id], references: [students.userId] }),
  lecturer: one(lecturers, {
    fields: [user.id],
    references: [lecturers.userId],
  }),
  institutionAdmin: one(institutions, {
    fields: [user.id],
    references: [institutions.adminUserId],
  }),
}));

export const studentRelations = relations(students, ({ one, many }) => ({
  user: one(user, { fields: [students.userId], references: [user.id] }),
  lecturerEnrolments: many(studentLecturers),
  institutionMemberships: many(studentInstitutions),
}));

export const lecturerRelations = relations(lecturers, ({ one, many }) => ({
  user: one(user, { fields: [lecturers.userId], references: [user.id] }),
  institution: one(institutions, {
    fields: [lecturers.institutionId],
    references: [institutions.id],
  }),
  studentEnrolments: many(studentLecturers),
  sentInvites: many(invites),
}));

export const institutionRelations = relations(
  institutions,
  ({ one, many }) => ({
    adminUser: one(user, {
      fields: [institutions.adminUserId],
      references: [user.id],
    }),
    lecturers: many(lecturers),
    studentMemberships: many(studentInstitutions),
  }),
);

export const studentLecturerRelations = relations(
  studentLecturers,
  ({ one }) => ({
    student: one(students, {
      fields: [studentLecturers.studentId],
      references: [students.id],
    }),
    lecturer: one(lecturers, {
      fields: [studentLecturers.lecturerId],
      references: [lecturers.id],
    }),
  }),
);

export const studentInstitutionRelations = relations(
  studentInstitutions,
  ({ one }) => ({
    student: one(students, {
      fields: [studentInstitutions.studentId],
      references: [students.id],
    }),
    institution: one(institutions, {
      fields: [studentInstitutions.institutionId],
      references: [institutions.id],
    }),
  }),
);

export const inviteRelations = relations(invites, ({ one }) => ({
  lecturer: one(lecturers, {
    fields: [invites.lecturerId],
    references: [lecturers.id],
  }),
}));
