import { motion } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { initials } from "@/lib/utils/greetings";

export function AvatarRow({
  people,
  prefix = "",
}: {
  people: { id: string; name: string }[];
  prefix?: string;
}) {
  return (
    <div className="no-scrollbar flex gap-5 overflow-x-auto pb-2">
      {people.map((p, i) => (
        <motion.div
          key={p.id}
          custom={i}
          variants={fadeUp}
          className="flex shrink-0 flex-col items-center gap-2"
        >
          <div
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--chart-1), var(--chart-2))",
              fontFamily: "var(--font-apfel-fett)",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            {initials(p.name)}
          </div>
          <span className="text-muted-foreground max-w-[80px] truncate text-[12px]">
            {prefix}
            {p.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
