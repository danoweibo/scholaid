"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BulbIcon,
  CloudIcon,
  TeamIcon,
  CodeIcon,
  DollarIcon,
} from "@/components/icons/base";

const DESKTOP_PATH =
  "M 1152,28 C 1152,9 1148,4 1140,1.5 C 1133,0 1125,0 1116,0 L 36,0 C 27,0 19,0 12,1.5 C 4,4 0,9 0,28 C 0,47 4,52 12,54.5 C 19,56 27,56 36,56 L 1116,56 C 1125,56 1133,56 1140,54.5 C 1148,52 1152,47 1152,28 Z";

const MOBILE_PATH =
  "M 576,0 L 1100,0 C 1136,0 1152,10 1152,28 C 1152,46 1136,56 1100,56 L 52,56 C 16,56 0,46 0,28 C 0,10 16,0 52,0 Z";

const navLinks = [
  { label: "Solutions", icon: BulbIcon },
  { label: "Resources", icon: CloudIcon },
  { label: "Community", icon: TeamIcon },
  { label: "Developer", icon: CodeIcon },
  { label: "Pricing", icon: DollarIcon },
];

export function Navbar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="relative w-full max-w-6xl">
        <svg
          className="absolute inset-0 h-14 w-full"
          viewBox="0 0 1152 56"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={isMobile ? MOBILE_PATH : DESKTOP_PATH} fill="#19324D" />
        </svg>

        <div className="relative z-10 flex h-14 w-full items-center justify-between px-6 md:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/images/logotype-0.png"
              alt="Scholaid"
              width={120}
              height={30}
              className="h-auto w-30 object-contain"
              priority
            />
          </Link>

          {/* Navigation — pulled left closer to logo via mr-auto + ml-6 */}
          <ul className="mr-auto ml-6 hidden items-center gap-1 md:flex">
            {navLinks.map(({ label, icon: Icon }) => (
              <li key={label}>
                <Link
                  href="#"
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/signin"
              className="px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              Sign up
            </Link>
            <Link
              href="#"
              className="cursor-pointer rounded-lg border-b-[4px] border-gray-400 bg-gray-50 px-6 py-2 text-sm font-semibold text-[#19324D] transition-all hover:-translate-y-[1px] hover:border-b-[6px] hover:brightness-110 active:translate-y-[2px] active:border-b-[2px] active:brightness-90"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
