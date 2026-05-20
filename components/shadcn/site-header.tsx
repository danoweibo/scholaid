/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useScholaidSession } from "@/lib/auth/session";
import { fadeUp } from "@/lib/motion";
import { pickFormalGreeting } from "@/lib/utils/greetings";

export function SiteHeader() {
  const { user } = useScholaidSession();

  /* scholaidRole can be "student" or "lecturer" */
  const SCHOLAID_ROLE = user?.scholaidRole ?? "student";

  const DISPLAY_NAME = (() => {
    const parts = user?.name?.trim().split(/\s+/) ?? [];

    // Lecturer => Dr. LastName
    if (SCHOLAID_ROLE === "lecturer") {
      const lastName = parts[parts.length - 1] ?? "";
      return `Dr. ${lastName}`;
    }

    // Student => FirstName
    return parts[0] ?? "";
  })();

  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    setGreeting(pickFormalGreeting());
  }, []);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />

        <motion.h1 variants={fadeUp} className="text-lg tracking-tight">
          {greeting}, <span className="font-bold">{DISPLAY_NAME}</span>
        </motion.h1>
      </div>
    </header>
  );
}
