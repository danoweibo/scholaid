"use client";
import { motion, stagger } from "motion/react";
import { AvatarRow } from "@/components/avatar-row";
import { ChartAreaInteractive } from "@/components/shadcn/chart-area-interactive";
import { DataTable } from "@/components/shadcn/data-table";
import { SectionCards } from "@/components/shadcn/section-cards";
import { STUDENTS } from "@/lib/demo";
import { fadeUp } from "@/lib/motion";
import data from "./data.json";
import type { Variants } from "motion/react";

export default function LecturerDashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <section className="space-y-4 pb-4">
              <motion.h2 variants={fadeUp} className="text-lg font-semibold">
                Your Students
              </motion.h2>
              <motion.div variants={stagger}>
                <AvatarRow people={STUDENTS} />
              </motion.div>
            </section>
            {/* <ChartAreaInteractive /> */}
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
