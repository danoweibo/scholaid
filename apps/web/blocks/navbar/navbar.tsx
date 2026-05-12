"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1279px)");
    const update = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setMenuOpen(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
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

            {/* Desktop Navigation */}
            <ul className="mr-auto ml-6 hidden items-center gap-1 xl:flex">
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

            {/* Desktop Actions */}
            <div className="hidden items-center gap-2 xl:flex">
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

            {/* Hamburger — visible below xl */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="relative flex h-8 w-8 flex-col items-end justify-center gap-0 focus:outline-none xl:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <motion.span
                animate={
                  menuOpen
                    ? { rotate: 45, y: 4, width: "24px" }
                    : { rotate: 0, y: 0, width: "24px" }
                }
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="block h-0.5 origin-center rounded-full bg-white"
                style={{ width: 24 }}
              />
              <motion.span
                animate={
                  menuOpen
                    ? { rotate: -45, y: -4, width: "24px" }
                    : { rotate: 0, y: 0, width: "16px" }
                }
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="mt-1.5 block h-0.5 origin-center rounded-full bg-white"
                style={{ width: 16 }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 flex flex-col bg-[#19324D] xl:hidden"
          >
            {/* Top spacer — clears the navbar bar */}
            <div className="h-[4.5rem] shrink-0" />

            {/* Nav Links — grow to fill space */}
            <div className="flex flex-1 flex-col justify-center px-6">
              <ul className="flex flex-col gap-1">
                {navLinks.map(({ label, icon: Icon }, i) => (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.25 }}
                  >
                    <Link
                      href="#"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Actions pinned to bottom */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.25 }}
              className="flex shrink-0 flex-col gap-3 border-t border-white/10 px-6 py-6"
            >
              <Link
                href="/signin"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-center text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
              >
                Sign up
              </Link>
              <Link
                href="#"
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer rounded-lg border-b-[4px] border-gray-400 bg-gray-50 px-6 py-3 text-center text-sm font-semibold text-[#19324D] transition-all hover:-translate-y-[1px] hover:border-b-[6px] hover:brightness-110 active:translate-y-[2px] active:border-b-[2px] active:brightness-90"
              >
                Book a demo
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
