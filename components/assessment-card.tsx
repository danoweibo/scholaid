import { motion } from "motion/react";
import type { Assessment } from "@/lib/demo";
import { fadeUp } from "@/lib/motion";
import { formatDate } from "@/lib/utils/greetings";

const pillColors: Record<Assessment["category"], string> = {
  Assignment: "var(--chart-2)",
  Project: "var(--chart-3)",
  Presentation: "var(--chart-4)",
};

export function AssessmentCard({
  a,
  index,
  rightSlot,
  bottomStats,
}: {
  a: Assessment;
  index: number;
  rightSlot?: React.ReactNode;
  bottomStats?: React.ReactNode;
}) {
  const c = pillColors[a.category];
  return (
    <motion.article
      custom={index}
      variants={fadeUp}
      className="rounded-2xl border p-6"
      style={{
        background: `linear-gradient(135deg, color-mix(in oklch, ${c} 10%, var(--card)) 0%, var(--card) 60%)`,
        borderColor: "var(--border)",
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
          {a.category}
        </span>
      </div>
      <h3
        style={{ fontFamily: "var(--font-apfel-fett)", fontWeight: 700 }}
        className="text-foreground text-base"
      >
        {a.title}
      </h3>
      <p className="text-muted-foreground mt-1 text-[13px]">
        Lecturer: {a.lecturer}
      </p>
      <p className="text-foreground/80 mt-3 text-sm">{a.description}</p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <span className="text-muted-foreground text-xs">
          {formatDate(a.due)}
        </span>
        {rightSlot}
      </div>
      {bottomStats && <div className="mt-4 border-t pt-3">{bottomStats}</div>}
    </motion.article>
  );
}
