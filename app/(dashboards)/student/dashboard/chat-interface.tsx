"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Role = "user" | "assistant";

interface Message {
  role: Role;
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Append empty assistant message to stream into
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: updatedMessages,
          systemPrompt: "You are a Scholaid Assist", // pass from props
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-yellow-400">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L15.5 8.5L22 9.5L17 14.5L18 21L12 17.5L6 21L7 14.5L2 9.5L8.5 8.5L12 2Z"
              fill="white"
              opacity="0.9"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm leading-none font-medium text-zinc-900 dark:text-zinc-100">
            Gemini Flash
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">gemini-1.5-flash</p>
        </div>
        <div className="ml-auto h-2 w-2 rounded-full bg-green-500" />
      </header>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-yellow-400">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L15.5 8.5L22 9.5L17 14.5L18 21L12 17.5L6 21L7 14.5L2 9.5L8.5 8.5L12 2Z"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
              How can I help you today?
            </p>
            <p className="max-w-xs text-sm text-zinc-400">
              Powered by Gemini 1.5 Flash. Fast, free, and ready to assist.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex max-w-[85%] gap-3 ${
              msg.role === "user" ? "flex-row-reverse self-end" : "self-start"
            }`}
          >
            {/* Avatar */}
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                msg.role === "user"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gradient-to-br from-blue-500 via-green-500 to-yellow-400"
              }`}
            >
              {msg.role === "user" ? (
                "You"
              ) : (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L15.5 8.5L22 9.5L17 14.5L18 21L12 17.5L6 21L7 14.5L2 9.5L8.5 8.5L12 2Z"
                    fill="white"
                    opacity="0.9"
                  />
                </svg>
              )}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "rounded-tr-sm bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100"
                  : "rounded-tl-sm bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              }`}
            >
              {msg.content}
              {/* Streaming cursor */}
              {isLoading &&
                i === messages.length - 1 &&
                msg.role === "assistant" && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-zinc-400 align-middle" />
                )}
              {/* Typing indicator (empty assistant message) */}
              {isLoading &&
                i === messages.length - 1 &&
                msg.role === "assistant" &&
                msg.content === "" && (
                  <span className="flex h-5 items-center gap-1">
                    {[0, 1, 2].map((n) => (
                      <span
                        key={n}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"
                        style={{ animationDelay: `${n * 0.15}s` }}
                      />
                    ))}
                  </span>
                )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 bg-white px-4 pt-3 pb-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 transition-colors focus-within:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message Gemini…"
            rows={1}
            disabled={isLoading}
            className="max-h-[120px] flex-1 resize-none overflow-y-auto bg-transparent text-sm leading-relaxed text-zinc-800 placeholder-zinc-400 outline-none dark:text-zinc-200"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 transition-all hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-600"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12H19M19 12L12 5M19 12L12 19" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-400">
          Gemini may make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
