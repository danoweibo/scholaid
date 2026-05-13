"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "./icons/socials";
import { signUp } from "@/lib/auth/auth";
import type { ScholaidRole } from "@/lib/auth/types";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const signUpSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    scholaidRole: z.enum(["student", "lecturer", "institution"], {
      error: "Please select a role.",
    }),
    institutionName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      data.scholaidRole !== "institution" ||
      (data.institutionName && data.institutionName.trim().length > 0),
    {
      message: "Institution name is required.",
      path: ["institutionName"],
    },
  );

type SignUpFormData = z.infer<typeof signUpSchema>;

// ---------------------------------------------------------------------------
// Role options
// ---------------------------------------------------------------------------

const ROLE_OPTIONS: {
  value: ScholaidRole;
  label: string;
  description: string;
}[] = [
  {
    value: "student",
    label: "Student",
    description: "Access courses and CBT testing",
  },
  {
    value: "lecturer",
    label: "Lecturer",
    description: "Create lessons and manage students",
  },
  {
    value: "institution",
    label: "Institution",
    description: "Manage lecturers and students",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    scholaidRole: "student",
    institutionName: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>>
  >({});

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof SignUpFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setServerError("");
    setErrors({});

    // -----------------------------------------------------------------------
    // Client-side validation
    // -----------------------------------------------------------------------

    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignUpFormData, string>> = {};

      result.error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path[0] as keyof SignUpFormData;

        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // ---------------------------------------------------------------------
      // Payload
      // ---------------------------------------------------------------------

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        scholaidRole: formData.scholaidRole,
        ...(formData.scholaidRole === "institution" && {
          institutionName: formData.institutionName,
        }),
      };

      // ---------------------------------------------------------------------
      // Sign up
      // ---------------------------------------------------------------------

      const signUpResult = await signUp.email(payload);

      if (signUpResult.error) {
        setServerError(
          signUpResult.error.message ?? "Sign up failed. Please try again.",
        );

        return;
      }

      // ---------------------------------------------------------------------
      // Success redirect
      // ---------------------------------------------------------------------

      router.push("/dashboard");
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isInstitution = formData.scholaidRole === "institution";

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>

          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>

        {/* Server error */}

        {serverError && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-500">
            {serverError}
          </p>
        )}

        {/* Full Name */}

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>

          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            className="bg-background"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />

          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </Field>

        {/* Email */}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-background"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

          {errors.email ? (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          ) : (
            <FieldDescription>
              We&apos;ll use this to contact you. We will not share your email
              with anyone else.
            </FieldDescription>
          )}
        </Field>

        {/* Role */}

        <Field>
          <FieldLabel htmlFor="scholaidRole">Role</FieldLabel>

          <select
            id="scholaidRole"
            name="scholaidRole"
            required
            value={formData.scholaidRole}
            onChange={handleChange}
            disabled={loading}
            className={cn(
              "bg-background border-input w-full rounded-md border px-3 py-2 text-sm",
              "focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} — {opt.description}
              </option>
            ))}
          </select>

          {errors.scholaidRole && (
            <p className="mt-1 text-xs text-red-500">{errors.scholaidRole}</p>
          )}
        </Field>

        {/* Institution Name */}

        {isInstitution && (
          <Field>
            <FieldLabel htmlFor="institutionName">Institution Name</FieldLabel>

            <Input
              id="institutionName"
              name="institutionName"
              type="text"
              placeholder="University of Lagos"
              required
              className="bg-background"
              value={formData.institutionName}
              onChange={handleChange}
              disabled={loading}
            />

            {errors.institutionName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.institutionName}
              </p>
            )}
          </Field>
        )}

        {/* Password */}

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>

          <Input
            id="password"
            name="password"
            type="password"
            required
            className="bg-background"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

          {errors.password ? (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          ) : (
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
          )}
        </Field>

        {/* Confirm Password */}

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>

          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            required
            className="bg-background"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />

          {errors.confirmPassword ? (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword}
            </p>
          ) : (
            <FieldDescription>Please confirm your password.</FieldDescription>
          )}
        </Field>

        {/* Submit */}

        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        {/* Google */}

        <Field>
          <Button variant="outline" type="button" disabled={loading}>
            <GoogleIcon className="mr-1 h-6 w-6" />
            Login with Google
          </Button>

          <FieldDescription className="px-6 text-center">
            Already have an account?{" "}
            <a href="/signin" className="underline underline-offset-4">
              Sign in
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
