"use client";

import { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Users,
  Zap,
  Plus,
  Sparkles,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { AttendanceToast } from "@/components/attendance-toast";
import { LECTURER_NAME, STUDENTS } from "@/lib/demo";
import { fadeUp, stagger } from "@/lib/motion";

const tiles = [
  { id: "me", name: `${LECTURER_NAME} (You)` },
  ...STUDENTS.slice(0, 3),
];

export default function LecturerClassroom() {
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [topic, setTopic] = useState("Logic gates");
  const [question, setQuestion] = useState(
    "What is the time complexity of quicksort?",
  );
  const [options, setOptions] = useState([
    "O(n)",
    "O(n log n)",
    "O(n²)",
    "O(log n)",
  ]);
  const [correct, setCorrect] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState<"general" | "specific">("general");
  const [targetStudent, setTargetStudent] = useState<string>(STUDENTS[0].id);
  const [history, setHistory] = useState<
    { q: string; ts: string; target: string }[]
  >([]);

  async function generate() {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/attendance-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      setQuestion(data.question);
      setOptions(data.options);
      setCorrect(data.correct);
      if (data.error) toast.error(data.error);
      else toast.success("Question generated");
    } catch {
      toast.error("Failed to generate question");
    } finally {
      setGenerating(false);
    }
  }

  function fire() {
    if (cooldown > 0 || !question.trim()) return;
    setCooldown(15);
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    const targetName =
      mode === "general"
        ? "All students"
        : (STUDENTS.find((s) => s.id === targetStudent)?.name ?? "Student");
    setHistory((h) => [
      { q: question, ts: new Date().toLocaleTimeString(), target: targetName },
      ...h,
    ]);
    toast.custom(
      (id) => (
        <AttendanceToast
          question={
            mode === "specific" ? `[For ${targetName}] ${question}` : question
          }
          options={options}
          onAnswer={(a) => {
            toast.dismiss(id);
            toast.success(`Answer from ${targetName}: ${a}`);
          }}
          onExpire={() => toast.dismiss(id)}
        />
      ),
      { duration: 10000 },
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-6rem)] gap-6 lg:grid-cols-[1fr_320px]">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="space-y-4"
      >
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between"
        >
          <h1
            style={{ fontFamily: "var(--font-apfel-fett)", fontWeight: 800 }}
            className="text-2xl"
          >
            Scholaid Classroom
          </h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {tiles.length} participants
            </span>
            <button
              onClick={() => setParticipantsOpen(true)}
              className="rounded-full p-2"
              style={{ background: "var(--muted)" }}
            >
              <Users className="h-4 w-4" />
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full px-4 py-1.5 text-xs font-medium text-white"
              style={{ background: "var(--destructive)" }}
            >
              End Class
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          }}
        >
          {tiles.map((t, i) => (
            <motion.div
              key={t.id}
              custom={i}
              variants={fadeUp}
              className="relative aspect-video overflow-hidden rounded-xl border"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklch, var(--chart-5) 60%, var(--background)), var(--background))",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white/30">
                <Users className="h-10 w-10" />
              </div>
              <span
                className="absolute bottom-2 left-2 rounded-full px-2 py-1 text-xs text-white"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                {t.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <div className="fixed bottom-8 left-1/2 z-30 -translate-x-1/2">
          <div
            className="flex items-center gap-2 rounded-full border p-2 shadow-lg"
            style={{ background: "var(--card)" }}
          >
            <CtlBtn active={mic} onClick={() => setMic((v) => !v)}>
              {mic ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </CtlBtn>
            <CtlBtn active={cam} onClick={() => setCam((v) => !v)}>
              {cam ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
            </CtlBtn>
            <CtlBtn active>
              <ScreenShare className="h-4 w-4" />
            </CtlBtn>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white"
              style={{ background: "var(--destructive)" }}
            >
              <PhoneOff className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.section>

      <motion.aside
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="space-y-4 rounded-2xl border p-5"
        style={{ background: "var(--card)" }}
      >
        <motion.h2
          variants={fadeUp}
          style={{ fontFamily: "var(--font-apfel-fett)", fontWeight: 800 }}
          className="text-lg"
        >
          Attendance Check
        </motion.h2>

        <motion.div variants={fadeUp} className="space-y-2">
          <label className="text-muted-foreground text-[11px] tracking-wider uppercase">
            Topic
          </label>
          <div className="flex gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Logic gates"
              className="focus:border-primary w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none"
            />
            <motion.button
              whileHover={{ scale: generating ? 1 : 1.04 }}
              whileTap={{ scale: generating ? 1 : 0.96 }}
              onClick={generate}
              disabled={generating || !topic.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-medium disabled:opacity-60"
              style={{
                background: "var(--accent)",
                color: "var(--accent-foreground)",
              }}
            >
              {generating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {generating ? "..." : "Generate"}
            </motion.button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-2">
          <label className="text-muted-foreground text-[11px] tracking-wider uppercase">
            Mode
          </label>
          <div className="flex gap-2">
            {(["general", "specific"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 rounded-lg px-2 py-1.5 text-xs font-medium capitalize transition-colors"
                style={
                  mode === m
                    ? {
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }
                    : { background: "var(--muted)", color: "var(--foreground)" }
                }
              >
                {m === "general" ? "General" : "Specific student"}
              </button>
            ))}
          </div>
          {mode === "specific" && (
            <select
              value={targetStudent}
              onChange={(e) => setTargetStudent(e.target.value)}
              className="focus:border-primary w-full rounded-lg border bg-transparent px-2 py-1.5 text-sm outline-none"
            >
              {STUDENTS.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  style={{ background: "var(--card)" }}
                >
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </motion.div>

        <motion.input
          variants={fadeUp}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question..."
          className="focus:border-primary w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none"
        />
        <motion.div variants={stagger} className="space-y-2">
          {options.map((o, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex items-center gap-2"
            >
              <button
                onClick={() => setCorrect(i)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                style={
                  correct === i
                    ? {
                        background: "var(--primary)",
                        borderColor: "var(--primary)",
                      }
                    : {}
                }
              >
                {correct === i && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </button>
              <input
                value={o}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  setOptions(next);
                }}
                placeholder={`Option ${i + 1}`}
                className="focus:border-primary w-full rounded-lg border bg-transparent px-3 py-1.5 text-sm outline-none"
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          variants={fadeUp}
          whileHover={{ scale: cooldown ? 1 : 1.02 }}
          whileTap={{ scale: cooldown ? 1 : 0.98 }}
          onClick={fire}
          disabled={cooldown > 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white disabled:opacity-60"
          style={{ background: "var(--primary)" }}
        >
          <Zap className="h-4 w-4" />
          {cooldown > 0
            ? `Cooling down ${cooldown}s`
            : "🔥 Fire Question (10s)"}
        </motion.button>

        {history.length > 0 && (
          <motion.div variants={fadeUp} className="space-y-1 pt-2">
            <p className="text-muted-foreground text-[11px] tracking-wider uppercase">
              History
            </p>
            {history.map((h, i) => (
              <div
                key={i}
                className="text-muted-foreground flex justify-between gap-2 text-xs"
              >
                <span className="truncate">{h.q}</span>
                <span className="ml-2 shrink-0">
                  {h.target} · {h.ts}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </motion.aside>

      <AnimatePresence>
        {participantsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setParticipantsOpen(false)}
              style={{ background: "rgba(0,0,0,0.3)" }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 w-[240px] border-l p-5"
              style={{ background: "var(--card)" }}
            >
              <p className="mb-4 text-sm font-semibold">Participants</p>
              <ul className="space-y-3">
                {tiles.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 text-sm">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--chart-1), var(--chart-2))",
                      }}
                    >
                      <Plus className="h-3 w-3 -rotate-45" />
                    </div>
                    {t.name}
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function CtlBtn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full"
      style={
        active
          ? { background: "var(--primary)", color: "var(--primary-foreground)" }
          : { background: "var(--muted)", color: "var(--foreground)" }
      }
    >
      {children}
    </motion.button>
  );
}
