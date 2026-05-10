import { useRouter } from "next/navigation";

/**
 * Scholaid entity types — mirrors the server's ScholaidRole type.
 * Stored as `scholaidRole` on the better-auth user row.
 */
export type ScholaidRole = "student" | "lecturer" | "institution";

/**
 * Student subtypes — used to gate CBT access.
 * `enthusiast`  → learning only, no CBT access
 * `standard`    → full access including CBT subdomain
 */
export type StudentType = "enthusiast" | "standard";

/**
 * The Scholaid user shape returned by useSession() / getSession().
 * Extends better-auth's base user with our additionalFields.
 */
export interface ScholaidUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  scholaidRole: ScholaidRole;
  institutionName?: string | null;
  // admin plugin fields
  role: string; // 'user' | 'admin'
  banned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Full session object shape from useSession().
 */
export interface ScholaidSession {
  user: ScholaidUser;
  session: {
    id: string;
    token: string;
    expiresAt: Date;
    userId: string;
  };
}

/**
 * Sign-up payload shape.
 * `scholaidRole` differentiates student / lecturer / institution at registration.
 * `institutionName` is only required when scholaidRole === 'institution'.
 */
export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  scholaidRole: ScholaidRole;
  institutionName?: string;
}

/* `better-auth` signout interface. */
export type SignOutOptions = {
  router?: ReturnType<typeof useRouter>;
  redirectTo?: string;
  onSuccess?: () => void;
};
