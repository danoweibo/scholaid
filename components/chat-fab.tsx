// chat-fab.tsx
import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SilhouetteIcon } from "@/components/icons/base";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatFab() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Hi! I'm Scholaid Assist. Ask me anything about your studies.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    const next: Msg[] = [
      ...messages,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ];
    setMessages(next);
    setInput("");
    setStreaming(true);

    try {
      // Send all messages except the empty assistant placeholder.
      const payload = next.filter((m) => m.content).slice(0, -1);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Sorry, I hit a snag. Try again.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed right-7 bottom-7 z-50 flex h-15 w-15 items-center justify-center rounded-full text-white"
        style={{
          background: "var(--primary)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        }}
        aria-label="Open Scholaid Assist"
      >
        <div>
          <SilhouetteIcon className="h-7 w-7" />
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            style={{
              transformOrigin: "bottom right",
              background: "var(--card)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
            className="fixed right-7 bottom-28 z-50 flex h-130 w-[calc(100vw-2rem)] max-w-95 flex-col overflow-hidden rounded-2xl border"
          >
            <div
              className="flex items-center justify-between px-5 py-4 text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--chart-3))",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-apfel-fett)",
                  fontWeight: 800,
                }}
              >
                Scholaid Assist
              </span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[78%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap"
                    style={
                      m.role === "user"
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
                    {m.content ||
                      (streaming && i === messages.length - 1 ? "…" : "")}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex items-center gap-2 p-3"
              style={{ background: "var(--muted)" }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ask anything…"
                className="placeholder:text-muted-foreground flex-1 resize-none rounded-xl bg-transparent px-3 py-2 text-sm outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={send}
                disabled={streaming || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white disabled:opacity-50"
                style={{ background: "var(--primary)" }}
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
