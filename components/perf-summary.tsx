"use client";

import { useState } from "react";
import { motion } from "motion/react";

export function PerformanceSummaryButton({
  role,
  metrics,
}: {
  role: "student" | "lecturer";
  metrics: { score: number; attendance: number; participation: number };
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setText("");
    setLoading(true);
    try {
      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, metrics }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((t) => t + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      setText("Could not generate summary right now.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={run}
        disabled={loading}
        className="rounded-full px-4 py-2 text-[13px] font-medium disabled:opacity-60"
        style={{
          background: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        {loading ? "Thinking…" : "Generate Summary"}
      </motion.button>
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-2xl border p-4 text-sm leading-relaxed"
          style={{ background: "var(--background)" }}
        >
          <div
            className="text-foreground mb-1"
            style={{ fontFamily: "var(--font-apfel-fett)", fontWeight: 700 }}
          >
            What this means…
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap">{text}</p>
        </motion.div>
      )}
    </div>
  );
}
