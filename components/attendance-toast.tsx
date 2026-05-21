import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { motion } from "motion/react";

export function AttendanceToast({
  question,
  options,
  onAnswer,
  onExpire,
}: {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
  onExpire: () => void;
}) {
  const DURATION = 10;
  const [remaining, setRemaining] = useState(DURATION);
  const [selected, setSelected] = useState<string | null>(null);
  const r = 16;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    const t = setInterval(() => setRemaining((s) => s - 0.1), 100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (remaining <= 0 && !selected) onExpire();
  }, [remaining, selected, onExpire]);

  function pick(opt: string) {
    if (selected) return;
    setSelected(opt);
    setTimeout(() => onAnswer(opt), 500);
  }

  const offset = c - (Math.max(remaining, 0) / DURATION) * c;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className="w-[320px] rounded-[20px] border p-5"
      style={{
        background: "var(--card)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
      }}
    >
      <div className="mb-3 flex items-center gap-3">
        <svg width={36} height={36}>
          <g transform="rotate(-90 18 18)">
            <circle
              cx={18}
              cy={18}
              r={r}
              fill="none"
              stroke="var(--muted)"
              strokeWidth={3}
            />
            <circle
              cx={18}
              cy={18}
              r={r}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
          </g>
        </svg>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Zap className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
          Answer now!
        </div>
      </div>
      <p className="mb-3 text-sm font-semibold">{question}</p>
      <div className="space-y-2">
        {options.map((o) => {
          const active = selected === o;
          return (
            <motion.button
              key={o}
              whileTap={{ scale: 0.97 }}
              onClick={() => pick(o)}
              disabled={!!selected}
              className="w-full rounded-xl px-3 py-2 text-left text-sm transition-colors disabled:opacity-60"
              style={
                active
                  ? {
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }
                  : { background: "var(--muted)", color: "var(--foreground)" }
              }
            >
              {o}
            </motion.button>
          );
        })}
      </div>
      {selected && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center text-xs"
          style={{ color: "var(--chart-2)" }}
        >
          Submitted ✓
        </motion.p>
      )}
    </motion.div>
  );
}
