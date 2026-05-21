/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { AvatarRow } from "@/components/avatar-row";
import { PerfRings } from "@/components/perf-rings";
import { PerformanceSummaryButton } from "@/components/perf-summary";
import { StatCard } from "@/components/stat-card";
import { LECTURERS, STUDENT_NAME } from "@/lib/demo";
import { fadeUp, stagger } from "@/lib/motion";
import { pickGreeting } from "@/lib/utils/greetings";

// Metadata must be exported from a server component — add this in a
// parent layout.tsx or a separate metadata.ts if you need per-page titles.
// export const metadata = { title: "Dashboard — Scholaid Student" };

export default function StudentOverviewPage() {
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => setGreeting(pickGreeting()), []);

  const metrics: [
    { label: string; value: number; color: string },
    { label: string; value: number; color: string },
    { label: string; value: number; color: string },
  ] = [
    { label: "Average Daily Score", value: 45, color: "var(--chart-1)" },
    { label: "Attendance Rating", value: 87, color: "var(--chart-2)" },
    { label: "Participation Quality", value: 55, color: "var(--chart-3)" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-10"
    >
      <motion.div
        variants={stagger}
        className="flex flex-col gap-4 md:flex-row"
      >
        <StatCard
          label="Outstanding Assessment"
          value={3}
          caption="View task"
          to="/student/outstanding"
          variant="outstanding"
          index={0}
        />
        <StatCard
          label="Submitted"
          value={2}
          caption="Check progress"
          to="/student/submitted"
          variant="submitted"
          index={1}
        />
        <StatCard
          label="Graded Assessment"
          value={1}
          caption="See scores"
          to="/student/graded"
          variant="graded"
          index={2}
        />
      </motion.div>

      <section className="space-y-4">
        <motion.h2
          variants={fadeUp}
          className="text-lg font-semibold"
          style={{ fontFamily: "var(--font-apfel)" }}
        >
          Your Lecturers
        </motion.h2>
        <motion.div variants={stagger}>
          <AvatarRow people={LECTURERS} />
        </motion.div>
      </section>

      <motion.section
        variants={fadeUp}
        className="rounded-2xl p-6"
        style={{ background: "var(--muted)" }}
      >
        <h2 className="mb-4 text-lg font-semibold">Your Performance</h2>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <PerfRings metrics={metrics} />
          <PerformanceSummaryButton
            role="student"
            metrics={{ score: 45, attendance: 87, participation: 55 }}
          />
        </div>
      </motion.section>

      <section className="space-y-4">
        <motion.h2 variants={fadeUp} className="text-lg font-semibold">
          Resources & Materials
        </motion.h2>
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border py-16"
          style={{ background: "var(--card)" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 rounded-full"
            style={{
              border: "2px solid var(--border)",
              borderTopColor: "var(--primary)",
            }}
          />
          <span className="text-muted-foreground text-sm">Loading content</span>
          <Loader2 className="hidden" />
        </motion.div>
      </section>
    </motion.div>
  );
}
