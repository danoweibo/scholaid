"use client";

import { useRef, useState } from "react";
import { FileText, Film, Link as LinkIcon, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { fadeUp, stagger } from "@/lib/motion";

type Item = {
  id: string;
  name: string;
  course: string;
  size: string;
  type: "pdf" | "docx" | "video" | "link";
  uploaded: string;
};

const SEED: Item[] = [
  {
    id: "1",
    name: "Logic Gates – Week 4.pdf",
    course: "CSC 202",
    size: "2.4 MB",
    type: "pdf",
    uploaded: "Just now",
  },
  {
    id: "2",
    name: "Set Theory Notes.docx",
    course: "MTH 301",
    size: "340 KB",
    type: "docx",
    uploaded: "2 days ago",
  },
];

const COURSES = ["CSC 202", "MTH 301", "ENG 410"];

function iconFor(type: Item["type"]) {
  if (type === "video") return Film;
  if (type === "link") return LinkIcon;
  return FileText;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function inferType(name: string): Item["type"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "mov", "webm"].includes(ext)) return "video";
  if (["doc", "docx"].includes(ext)) return "docx";
  return "pdf";
}

export default function CoursewarePage() {
  const [items, setItems] = useState<Item[]>(SEED);
  const [course, setCourse] = useState(COURSES[0]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next: Item[] = Array.from(files).map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      course,
      size: fmtSize(f.size),
      type: inferType(f.name),
      uploaded: "Just now",
    }));
    setItems((prev) => [...next, ...prev]);
    toast.success(
      `Uploaded ${next.length} file${next.length === 1 ? "" : "s"} to ${course}`,
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8"
    >
      <motion.div variants={fadeUp}>
        <h1
          style={{
            fontFamily: "var(--font-apfel-fett)",
            fontWeight: 800,
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
          }}
        >
          Courseware
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Share notes, slides, and reference material with your students.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end"
      >
        <label className="block space-y-1.5">
          <span className="text-muted-foreground text-xs tracking-wider uppercase">
            Course
          </span>
          <div className="flex flex-wrap gap-2">
            {COURSES.map((c) => {
              const active = c === course;
              return (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCourse(c)}
                  className="rounded-full px-3 py-1.5 text-xs"
                  style={
                    active
                      ? {
                          background: "var(--primary)",
                          color: "var(--primary-foreground)",
                        }
                      : {
                          background: "var(--muted)",
                          color: "var(--foreground)",
                        }
                  }
                >
                  {c}
                </motion.button>
              );
            })}
          </div>
        </label>
      </motion.div>

      <motion.div
        variants={fadeUp}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors"
        style={{
          borderColor: dragOver ? "var(--primary)" : "var(--border)",
          background: dragOver
            ? "color-mix(in oklch, var(--primary) 8%, transparent)"
            : "var(--card)",
        }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: "color-mix(in oklch, var(--primary) 12%, transparent)",
          }}
        >
          <Upload className="h-5 w-5" style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <p className="text-sm font-medium">
            Drop files here or click to upload
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            PDF, DOCX, MP4 — up to 200 MB each
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        <h2 className="text-muted-foreground text-sm tracking-wider uppercase">
          Uploaded materials
        </h2>
        <div className="space-y-2">
          {items
            .filter((i) => i.course === course)
            .map((item) => {
              const Icon = iconFor(item.type);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between gap-4 rounded-xl border p-4"
                  style={{ background: "var(--card)" }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background:
                          "color-mix(in oklch, var(--chart-1) 14%, transparent)",
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: "var(--chart-1)" }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {item.course} · {item.size} · {item.uploaded}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setItems((prev) => prev.filter((i) => i.id !== item.id));
                      toast("Removed");
                    }}
                    className="text-muted-foreground hover:bg-muted rounded-full p-2"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          {items.filter((i) => i.course === course).length === 0 && (
            <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
              No materials uploaded for {course} yet.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
