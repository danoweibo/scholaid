"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AssessmentCard } from "@/components/assessment-card";
import { OUTSTANDING } from "@/lib/demo";
import { fadeUp, stagger } from "@/lib/motion";

export default function AssessmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Drawer is open when ?drawer=create is in the URL
  const drawer = searchParams.get("drawer") === "create";

  function openDrawer() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("drawer", "create");
    router.push(`?${params.toString()}`);
  }

  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("drawer");
    router.push(`?${params.toString()}`);
  }

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Assignment",
    action: "submit_file",
    due: "",
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8"
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <h1
          style={{
            fontFamily: "var(--font-apfel-fett)",
            fontWeight: 800,
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
          }}
        >
          Assessments
        </h1>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={openDrawer}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
          style={{ background: "var(--primary)" }}
        >
          <Plus className="h-4 w-4" /> Create Assessment
        </motion.button>
      </motion.div>

      <motion.div variants={stagger} className="space-y-4">
        {OUTSTANDING.map((a, i) => (
          <AssessmentCard
            key={a.id}
            a={a}
            index={i}
            bottomStats={
              <div className="text-muted-foreground flex items-center gap-5 text-xs">
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--chart-2)" }}
                  />
                  Submitted: 3
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--chart-1)" }}
                  />
                  Outstanding: 5
                </span>
              </div>
            }
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={closeDrawer}
              style={{ background: "rgba(0,0,0,0.4)" }}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col gap-4 overflow-y-auto border-l p-6"
              style={{ background: "var(--card)" }}
            >
              <div className="flex items-center justify-between">
                <h2
                  style={{
                    fontFamily: "var(--font-apfel-fett)",
                    fontWeight: 800,
                  }}
                  className="text-xl"
                >
                  New Assessment
                </h2>
                <button
                  onClick={closeDrawer}
                  className="hover:bg-muted rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Field label="Title">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="focus:border-primary w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none"
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={4}
                  className="focus:border-primary w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-sm outline-none"
                />
              </Field>
              <Field label="Category">
                <Pills
                  value={form.category}
                  options={["Assignment", "Project", "Presentation"]}
                  onChange={(v) => setForm({ ...form, category: v })}
                />
              </Field>
              <Field label="Action Type">
                <Pills
                  value={form.action}
                  options={[
                    { v: "submit_file", l: "Submit File" },
                    { v: "add_link", l: "Add Link" },
                    { v: "join_classroom", l: "Join Classroom" },
                  ]}
                  onChange={(v) => setForm({ ...form, action: v })}
                />
              </Field>
              <Field label="Due Date">
                <input
                  type="date"
                  value={form.due}
                  onChange={(e) => setForm({ ...form, due: e.target.value })}
                  className="focus:border-primary w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none"
                />
              </Field>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={closeDrawer}
                className="mt-4 w-full rounded-full py-3 text-sm font-medium text-white"
                style={{ background: "var(--primary)" }}
              >
                Create assessment
              </motion.button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-muted-foreground text-xs tracking-wider uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function Pills({
  value,
  options,
  onChange,
}: {
  value: string;
  options: (string | { v: string; l: string })[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.v;
        const l = typeof o === "string" ? o : o.l;
        const active = value === v;
        return (
          <motion.button
            key={v}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(v)}
            className="rounded-full px-3 py-1.5 text-xs"
            style={
              active
                ? {
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }
                : { background: "var(--muted)", color: "var(--foreground)" }
            }
          >
            {l}
          </motion.button>
        );
      })}
    </div>
  );
}
