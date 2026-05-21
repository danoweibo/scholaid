"use client";

import { usePathname } from "next/navigation";
import { ChatFab } from "@/components/chat-fab";

export function ConditionalChatFab() {
  const pathname = usePathname();
  if (pathname === "/student/classroom") return null;
  return <ChatFab />;
}
