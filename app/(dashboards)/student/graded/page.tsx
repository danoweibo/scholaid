"use client";

import { useState } from "react";
import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import { Modal } from "@/components/modal";
import { GRADED } from "@/lib/demo";
import { fadeUp, stagger } from "@/lib/motion";

const pillColors: Record<string, string> = {
  Assignment: "var(--chart-2)",
  Project: "var(--chart-3)",
  Presentation: "var(--chart-4)",
};

export default function StudentGradedPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = GRADED.find((g) => g.id === openId);

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
        Graded
      </motion.h1>
      <motion.div variants={stagger} className="space-y-4">
        {GRADED.map((g, i) => {
          const c = pillColors[g.category];
          return (
            <motion.article
              key={g.id}
              custom={i}
              variants={fadeUp}
              className="rounded-2xl border p-6"
              style={{
                background: `linear-gradient(135deg, color-mix(in oklch, ${c} 10%, var(--card)) 0%, var(--card) 60%)`,
              }}
            >
              <span
                className="rounded-full px-3 py-1 text-[11px] font-medium tracking-wide uppercase"
                style={{
                  background: `color-mix(in oklch, ${c} 20%, transparent)`,
                  color: c,
                }}
              >
                {g.category}
              </span>
              <h3
                className="mt-3"
                style={{
                  fontFamily: "var(--font-apfel-fett)",
                  fontWeight: 700,
                }}
              >
                {g.title}
              </h3>
              <p className="text-muted-foreground mt-1 text-[13px]">
                Lecturer: {g.lecturer}
              </p>
              <p className="text-muted-foreground mt-4 text-[11px] tracking-wider uppercase">
                Assessment Summary
              </p>
              <p className="text-foreground/80 mt-1 text-sm">{g.summary}</p>
              <div className="mt-5 flex flex-col items-end gap-1">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setOpenId(g.id)}
                  className="rounded-full px-5 py-2 text-[13px] font-medium text-white"
                  style={{ background: "var(--primary)" }}
                >
                  See grades
                </motion.button>
                <span className="text-muted-foreground text-[11px] italic">
                  Get info about your grades
                </span>
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      <Modal
        open={!!active}
        onClose={() => setOpenId(null)}
        title={active?.title}
      >
        {active && (
          <div className="space-y-4 text-center">
            <div
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-apfel-fett)",
                fontWeight: 800,
                fontSize: "3rem",
                color: "var(--primary)",
              }}
            >
              <NumberFlow value={active.grade} />
            </div>
            <div className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              {active.label}
            </div>
            <p className="text-foreground/80 text-left text-sm">
              {active.summary}
            </p>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
