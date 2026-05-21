"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation"; // ← only meaningful change
import { AssessmentCard } from "@/components/assessment-card";
import { Modal } from "@/components/modal";
import { OUTSTANDING } from "@/lib/demo";
import { fadeUp, stagger } from "@/lib/motion";

export default function StudentOutstandingPage() {
  const router = useRouter(); // ← replaces useNavigate()
  const [openModal, setOpenModal] = useState<null | {
    kind: "upload" | "link";
    id: string;
  }>(null);
  const [url, setUrl] = useState("");

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
        Outstandings
      </motion.h1>

      <motion.div variants={stagger} className="space-y-4">
        {OUTSTANDING.map((a, i) => (
          <AssessmentCard
            key={a.id}
            a={a}
            index={i}
            rightSlot={
              <div className="flex flex-col items-end gap-1">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (a.action === "classroom")
                      router.push("/student/classroom"); // ← navigate({ to }) → router.push()
                    else if (a.action === "link")
                      setOpenModal({ kind: "link", id: a.id });
                    else setOpenModal({ kind: "upload", id: a.id });
                  }}
                  className="rounded-full px-5 py-2 text-[13px] font-medium text-white"
                  style={{ background: "var(--primary)" }}
                >
                  {a.actionLabel}
                </motion.button>
                <span className="text-muted-foreground text-[11px] italic">
                  {a.hint}
                </span>
              </div>
            }
          />
        ))}
      </motion.div>

      <Modal
        open={openModal?.kind === "upload"}
        onClose={() => setOpenModal(null)}
        title="Submit your work"
      >
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-2xl p-12"
          style={{ border: "2px dashed var(--border)" }}
        >
          <motion.button
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-14 w-14 items-center justify-center rounded-full text-white"
            style={{ background: "var(--primary)" }}
          >
            <Plus className="h-6 w-6" />
          </motion.button>
          <p className="text-center text-sm font-medium">
            Add files or drag and drop to submit
          </p>
          <p className="text-muted-foreground text-xs">requires PDF or DOCX</p>
        </div>
      </Modal>

      <Modal
        open={openModal?.kind === "link"}
        onClose={() => setOpenModal(null)}
        title="Add a link"
      >
        <div className="space-y-4">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/your/repo"
            className="focus:border-primary w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setOpenModal(null);
              setUrl("");
            }}
            className="w-full rounded-full py-3 text-sm font-medium text-white"
            style={{ background: "var(--primary)" }}
          >
            Submit link
          </motion.button>
        </div>
      </Modal>
    </motion.div>
  );
}
