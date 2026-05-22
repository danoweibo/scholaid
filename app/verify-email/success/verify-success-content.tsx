"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import type { ScholaidUser } from "@/lib/auth/types";

function getRoleRedirect(role: ScholaidUser["scholaidRole"]) {
  if (role === "student") return "/student/dashboard";
  if (role === "lecturer") return "/lecturer/dashboard";
  if (role === "institution") return "/institution/dashboard";
  return "/dashboard";
}

const COUNTDOWN = 5;

export default function VerifySuccessContent() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(COUNTDOWN);
  const [destination, setDestination] = useState("/dashboard");

  // Resolve the role-based destination from the live session
  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        const user = data.user as ScholaidUser;
        setDestination(getRoleRedirect(user.scholaidRole));
      }
    });
  }, []);

  // Countdown then redirect
  useEffect(() => {
    if (seconds <= 0) {
      router.replace(destination);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, destination, router]);

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
          {/* Animated checkmark */}
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600 dark:text-green-400"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight">
            Email verified!
          </h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Your account is all set. You&apos;ll be taken to your dashboard in a
            moment.
          </p>

          {/* Countdown ring */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <svg
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - seconds / COUNTDOWN)}`}
                  strokeLinecap="round"
                  className="text-green-500 transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="text-lg font-semibold tabular-nums">
                {seconds}
              </span>
            </div>

            <button
              type="button"
              onClick={() => router.replace(destination)}
              className="hover:text-muted-foreground text-sm font-medium underline underline-offset-4"
            >
              Go to dashboard now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
