"use client";

import NumberFlow from "@number-flow/react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link"; // ← only change
import { fadeUp } from "@/lib/motion";

type Gradient = "outstanding" | "submitted" | "graded";

const gradients: Record<Gradient, string> = {
  outstanding:
    "linear-gradient(135deg, var(--chart-1) 0%, var(--chart-4) 100%)",
  submitted: "linear-gradient(135deg, var(--chart-2) 0%, var(--chart-3) 100%)",
  graded: "linear-gradient(135deg, var(--chart-3) 0%, var(--primary) 100%)",
};

export function StatCard({
  label,
  value,
  caption,
  to,
  variant,
  index,
}: {
  label: string;
  value: number;
  caption: string;
  to: string;
  variant: Gradient;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      className="relative flex flex-1 flex-col justify-between overflow-hidden p-6 text-white shadow-sm"
      style={{
        background: gradients[variant],
        borderRadius: 20,
        minHeight: 180,
      }}
    >
      <div className="text-sm font-medium text-white/80">{label}</div>
      <div
        className="my-3 text-5xl tabular-nums"
        style={{ fontFamily: "var(--font-apfel-fett)", fontWeight: 700 }}
      >
        <NumberFlow value={value} />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xs text-white/70">{caption}</span>
        <Link href={to}>
          {" "}
          {/* ← `to` → `href` */}
          <motion.span
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur"
          >
            <ArrowUpRight className="h-4 w-4 text-white" />
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
}
