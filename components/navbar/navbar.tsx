"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Logotype from "@/components/icons/logotype";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-4 right-0 left-0 z-50 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="bg-card border-border flex h-16 items-center justify-between rounded-3xl px-6 shadow-md">
          {/* Logo */}
          <Link
            href="/"
            className="text-primary flex shrink-0 items-center gap-2 text-xl font-bold"
          >
            {/* <Image
              src="/images/logotype.png"
              alt="ScholarAid Logo"
              className="scale-10"
              width={1081}
              height={270}
            /> */}
            <Logotype mode="base" className="h-auto w-64 opacity-90" />
          </Link>

          {/* Center Menu */}
          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-foreground/70 hover:text-foreground text-sm transition"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-foreground/70 hover:text-foreground text-sm transition"
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              className="text-foreground/70 hover:text-foreground text-sm transition"
            >
              FAQ
            </Link>
          </div>

          {/* Right Side: Login and Get Started */}
          <div className="hidden flex-shrink-0 items-center gap-3 md:flex">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="ml-auto p-2 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="mx-auto mt-3 flex max-w-7xl flex-col gap-3 px-6 pb-4 md:hidden">
            <Link
              href="#features"
              className="text-foreground/70 hover:text-foreground block py-2 text-sm"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-foreground/70 hover:text-foreground block py-2 text-sm"
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              className="text-foreground/70 hover:text-foreground block py-2 text-sm"
            >
              FAQ
            </Link>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
