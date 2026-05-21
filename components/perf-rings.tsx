import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";

type Metric = { label: string; value: number; color: string };

export function PerfRings({ metrics }: { metrics: [Metric, Metric, Metric] }) {
  const radii = [52, 40, 28];
  const stroke = 8;
  const size = 130;
  const center = size / 2;
  const avg = Math.round(
    metrics.reduce((a, m) => a + m.value, 0) / metrics.length,
  );

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {radii.map((r, i) => {
            const c = 2 * Math.PI * r;
            const value = metrics[i].value;
            return (
              <g key={i} transform={`rotate(-90 ${center} ${center})`}>
                <circle
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  strokeWidth={stroke}
                  stroke="var(--muted-foreground)"
                  strokeOpacity={0.18}
                />
                <motion.circle
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  strokeWidth={stroke}
                  stroke={metrics[i].color}
                  strokeLinecap="round"
                  strokeDasharray={c}
                  initial={{ strokeDashoffset: c }}
                  animate={{ strokeDashoffset: c - (value / 100) * c }}
                  transition={{
                    duration: 1.1,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.1 + i * 0.1,
                  }}
                />
              </g>
            );
          })}
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-2xl tabular-nums"
          style={{ fontFamily: "var(--font-apfel-fett)", fontWeight: 800 }}
        >
          <NumberFlow value={avg} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-3 text-sm">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: m.color }}
            />
            <span className="text-muted-foreground">{m.label}</span>
            <span
              className="ml-auto tabular-nums"
              style={{ fontFamily: "var(--font-apfel-fett)", fontWeight: 700 }}
            >
              <NumberFlow value={m.value} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
