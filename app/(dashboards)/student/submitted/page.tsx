"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { SUBMITTED } from "@/lib/demo";
import { fadeUp, stagger } from "@/lib/motion";
import { formatDate } from "@/lib/utils/greetings";

const pillColors: Record<string, string> = {
  Assignment: "var(--chart-2)",
  Project: "var(--chart-3)",
  Presentation: "var(--chart-4)",
};

export default function StudentSubmittedPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8"
    >
      <motion.h1
        variants={fadeUp}
        style={{
          fontFamily: "var(--font-apfel-fett)",
          fontWeight: 800,
          fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
        }}
      >
        Submitted
      </motion.h1>
      <motion.div variants={stagger} className="space-y-4">
        {SUBMITTED.map((s, i) => {
          const c = pillColors[s.category];
          return (
            <motion.article
              key={s.id}
              custom={i}
              variants={fadeUp}
              className="rounded-2xl border p-6"
              style={{
                background: `linear-gradient(135deg, color-mix(in oklch, ${c} 10%, var(--card)) 0%, var(--card) 60%)`,
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-medium tracking-wide uppercase"
                  style={{
                    background: `color-mix(in oklch, ${c} 20%, transparent)`,
                    color: c,
                  }}
                >
                  {s.category}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-apfel-fett)",
                  fontWeight: 700,
                }}
              >
                {s.title}
              </h3>
              <p className="text-muted-foreground mt-1 text-[13px]">
                Lecturer: {s.lecturer}
              </p>
              <p className="text-foreground/80 mt-3 text-sm">{s.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2
                    className="h-4 w-4"
                    style={{ color: "var(--chart-2)" }}
                  />
                  <span
                    className="font-bold"
                    style={{ color: "var(--chart-2)" }}
                  >
                    Submitted
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {formatDate(s.submittedOn)}
                </span>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
