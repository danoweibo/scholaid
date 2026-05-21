// app/student/outstanding/layout.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Outstanding — Scholaid" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
