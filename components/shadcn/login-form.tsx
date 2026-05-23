"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { useAuthStore } from "@/lib/auth/store";
import type { ScholaidUser } from "@/lib/auth/types";
import { cn } from "@/lib/utils";
import { GoogleIcon } from "../icons/socials";

function getRoleRedirect(role: ScholaidUser["scholaidRole"]) {
  if (role === "student") return "/student/dashboard";
  if (role === "lecturer") return "/lecturer/dashboard";
  if (role === "institution") return "/institution/dashboard";
  return "/dashboard";
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUnverified(false);
    setResendMessage("");

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        // Better-auth returns this code when the email isn't verified yet
        if (
          error.code === "EMAIL_NOT_VERIFIED" ||
          (error.message?.toLowerCase().includes("email") &&
            error.message?.toLowerCase().includes("verif"))
        ) {
          setUnverified(true);
          setError("Please verify your email before signing in.");
        } else {
          setError(error.message ?? "Sign in failed. Please try again.");
        }
        return;
      }

      if (data) {
        const user = data.user as ScholaidUser;
        useAuthStore.getState().setUser(data.user as ScholaidUser);
        router.push(getRoleRedirect(user.scholaidRole));
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) {
      setError("Enter your email address above, then click resend.");
      return;
    }

    setResendLoading(true);
    setResendMessage("");

    try {
      await authClient.sendVerificationEmail({ email });
      setResendMessage("Verification email sent! Check your inbox.");
    } catch {
      setResendMessage("Couldn't resend — please try again in a moment.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Sign in to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to log in to your account
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-500">
            <p>{error}</p>
            {unverified && (
              <div className="mt-2 flex flex-col items-center gap-1">
                <p className="text-xs text-red-400">
                  Didn&apos;t get the email?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-xs font-medium text-red-600 underline underline-offset-2 hover:text-red-800 disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </button>
              </div>
            )}
          </div>
        )}

        {resendMessage && (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-center text-sm text-green-600">
            {resendMessage}
          </p>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </Field>

        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button variant="outline" type="button" disabled={loading}>
            <GoogleIcon className="mr-1 h-6 w-6" />
            Login with Google
          </Button>

          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
