// app/lecturer/dashboard/layout.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Dashboard — Scholaid Lecturer" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
