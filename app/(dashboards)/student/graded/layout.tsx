// app/student/graded/layout.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Graded — Scholaid" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
