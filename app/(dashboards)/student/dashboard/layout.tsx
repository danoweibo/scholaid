"use client";
import { ChatFab } from "@/components/chat-fab";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ChatFab />
    </>
  );
}
