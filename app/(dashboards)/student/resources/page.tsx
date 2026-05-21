"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  FileType,
  Video,
  Link2,
  List,
  LayoutGrid,
  Search,
  FolderOpen,
  Download,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Modal } from "@/components/modal";
import { COURSES, RESOURCES, type Resource } from "@/lib/demo";
import { fadeUp, stagger } from "@/lib/motion";

const iconFor: Record<
  Resource["type"],
  React.ComponentType<{ className?: string }>
> = {
  pdf: FileText,
  docx: FileType,
  video: Video,
  link: Link2,
};

export default function StudentResourcesPage() {
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState<"list" | "grid">("list");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<Resource | null>(null);

  const filtered = useMemo(
    () =>
      RESOURCES.filter(
        (r) =>
          (filter === "All" || r.course === filter) &&
          r.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [filter, query],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside
        className="hidden h-fit rounded-2xl border p-4 lg:block"
        style={{ background: "var(--card)" }}
      >
        <p className="text-muted-foreground mb-3 text-[11px] tracking-wider uppercase">
          Courses
        </p>
        <ul className="space-y-1">
          {COURSES.map((c) => {
            const active = filter === c;
            return (
              <li key={c}>
                <motion.button
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(c)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  style={
                    active
                      ? {
                          background:
                            "color-mix(in oklch, var(--primary) 15%, transparent)",
                          color: "var(--primary)",
                        }
                      : { color: "var(--foreground)" }
                  }
                >
                  <FolderOpen className="h-4 w-4" />
                  {c}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </aside>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="space-y-5"
      >
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="text-muted-foreground text-sm">
            Resources <span className="mx-1">›</span>
            <span className="text-foreground">{filter}</span>
          </div>
          <div className="flex items-center gap-2">
            <label
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm"
              style={{ background: "var(--muted)" }}
            >
              <Search className="text-muted-foreground h-4 w-4" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files"
                className="placeholder:text-muted-foreground bg-transparent outline-none"
              />
            </label>
            <button
              onClick={() => setView("list")}
              className="rounded-full p-2"
              style={{
                background: view === "list" ? "var(--primary)" : "var(--muted)",
                color:
                  view === "list"
                    ? "var(--primary-foreground)"
                    : "var(--foreground)",
              }}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className="rounded-full p-2"
              style={{
                background: view === "grid" ? "var(--primary)" : "var(--muted)",
                color:
                  view === "grid"
                    ? "var(--primary-foreground)"
                    : "var(--foreground)",
              }}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden"
        >
          {COURSES.map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.95 }}
              layout
              onClick={() => setFilter(c)}
              className="rounded-full px-4 py-1.5 text-sm whitespace-nowrap"
              style={
                filter === c
                  ? {
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }
                  : { background: "var(--muted)", color: "var(--foreground)" }
              }
            >
              {c}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div
              key="list"
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {filtered.map((r, i) => {
                const Icon = iconFor[r.type];
                return (
                  <motion.button
                    key={r.id}
                    custom={i}
                    variants={fadeUp}
                    whileHover={{ y: -1 }}
                    onClick={() => setPreview(r)}
                    className="hover:bg-muted flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-colors"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ background: "var(--muted)" }}
                    >
                      <Icon className="text-muted-foreground h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {r.lecturer}
                      </p>
                    </div>
                    <span
                      className="hidden rounded-full px-2 py-0.5 text-[11px] sm:inline-block"
                      style={{
                        background:
                          "color-mix(in oklch, var(--primary) 12%, transparent)",
                        color: "var(--primary)",
                      }}
                    >
                      {r.course}
                    </span>
                    <span className="text-muted-foreground hidden text-xs md:inline">
                      {r.uploaded}
                    </span>
                    <span className="text-muted-foreground hidden text-xs md:inline">
                      {r.size}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-3 md:grid-cols-3"
            >
              {filtered.map((r, i) => {
                const Icon = iconFor[r.type];
                return (
                  <motion.button
                    key={r.id}
                    custom={i}
                    variants={fadeUp}
                    whileHover={{ y: -3 }}
                    onClick={() => setPreview(r)}
                    className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center"
                    style={{ background: "var(--card)" }}
                  >
                    <Icon className="text-muted-foreground h-10 w-10" />
                    <p className="line-clamp-2 text-sm font-semibold">
                      {r.name}
                    </p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px]"
                      style={{
                        background:
                          "color-mix(in oklch, var(--primary) 12%, transparent)",
                        color: "var(--primary)",
                      }}
                    >
                      {r.course}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {r.uploaded}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.name}
      >
        {preview && (
          <div className="space-y-4">
            <div
              className="flex h-48 items-center justify-center rounded-xl"
              style={{ background: "var(--muted)" }}
            >
              {(() => {
                const Icon = iconFor[preview.type];
                return <Icon className="text-muted-foreground h-16 w-16" />;
              })()}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Course</p>
                <p>{preview.course}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Lecturer</p>
                <p>{preview.lecturer}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Uploaded</p>
                <p>{preview.uploaded}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Size</p>
                <p>{preview.size}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-white"
              style={{ background: "var(--primary)" }}
            >
              <Download className="h-4 w-4" /> Download
            </motion.button>
          </div>
        )}
      </Modal>
    </div>
  );
}
