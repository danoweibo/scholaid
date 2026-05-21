"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Link from "next/link";
import { AttendanceToast } from "@/components/attendance-toast";
import { STUDENTS } from "@/lib/demo";
import { fadeUp, stagger } from "@/lib/motion";
import { getPusherClient } from "@/lib/pusher/client";

export default function StudentClassroomPage() {
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const tiles = [{ id: "you", name: "Daniel (You)" }, ...STUDENTS.slice(0, 3)];

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return; // shouldn't happen inside useEffect, but satisfies TS

    const channel = pusher.subscribe("classroom");

    channel.bind(
      "question-fired",
      (data: {
        question: string;
        options: string[];
        correct: number;
        target: string;
        mode: "general" | "specific";
      }) => {
        toast.custom(
          (id) => (
            <AttendanceToast
              question={data.question}
              options={data.options}
              onAnswer={(a) => {
                toast.dismiss(id);
                toast.success(`You answered: ${a}`);
              }}
              onExpire={() => toast.dismiss(id)}
            />
          ),
          { duration: 10000 },
        );
      },
    );

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("classroom");
    };
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-6"
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
        <span className="text-muted-foreground text-sm">
          {tiles.length} participants · live
        </span>
      </motion.div>

      <motion.div
        variants={stagger}
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
      >
        {tiles.map((t, i) => (
          <motion.div
            key={t.id}
            custom={i}
            variants={fadeUp}
            className="relative aspect-video overflow-hidden rounded-2xl border"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklch, var(--chart-5) 50%, var(--background)), var(--background))",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white/30">
              <Users className="h-12 w-12" />
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

      <motion.div
        variants={fadeUp}
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
      >
        <div
          className="flex items-center gap-2 rounded-full border p-2 shadow-lg"
          style={{ background: "var(--card)" }}
        >
          <ControlBtn active={mic} onClick={() => setMic((v) => !v)}>
            {mic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </ControlBtn>
          <ControlBtn active={cam} onClick={() => setCam((v) => !v)}>
            {cam ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4" />
            )}
          </ControlBtn>
          <ControlBtn active>
            <ScreenShare className="h-4 w-4" />
          </ControlBtn>
          <Link href="/student/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white"
              style={{ background: "var(--destructive)" }}
            >
              <PhoneOff className="h-4 w-4" />
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ControlBtn({
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
