"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleResend() {
    if (!email) return;
    setResendLoading(true);
    setMessage("");
    setIsError(false);

    try {
      await authClient.sendVerificationEmail({ email });
      setMessage("Verification email resent! Check your inbox.");
    } catch {
      setIsError(true);
      setMessage("Couldn't resend — please try again in a moment.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logotype-1.png"
              alt="Scholaid"
              width={120}
              height={30}
              className="h-auto w-30 object-contain"
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border px-8 py-10 text-center shadow-sm">
          {/* Icon */}
          <div className="mb-5 flex justify-center">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight">
            Check your inbox
          </h1>
          <p className="text-muted-foreground mb-1 text-sm">
            We sent a verification link to
          </p>
          {email && (
            <p className="text-foreground mb-6 text-sm font-semibold">
              {email}
            </p>
          )}
          <p className="text-muted-foreground mb-8 text-sm">
            Click the link in that email to verify your account and get started.
            It may take a minute or two to arrive.
          </p>

          {/* Resend */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-xs">
              Didn&apos;t receive it?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || !email}
              className="hover:text-muted-foreground text-sm font-medium underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {resendLoading ? "Sending..." : "Resend verification email"}
            </button>

            {message && (
              <p
                className={`text-xs ${isError ? "text-red-500" : "text-green-600"}`}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Back to sign in */}
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already verified?{" "}
          <a
            href="/signin"
            className="font-medium underline underline-offset-4"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
