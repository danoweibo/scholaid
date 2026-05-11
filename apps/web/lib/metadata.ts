import type { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: "Scholaid — Futurist Educational Infrastructure",
  description:
    "Scholaid orchestrates the academic journey through AI-driven insights, connecting students, faculty, and administrators in a high-performance ecosystem.",
  keywords: ["virtual learning environment", "academic analytics"],
  authors: [{ name: "DVNL Platforms" }],
  creator: "DVNL Platforms",
  openGraph: {
    title: "Scholaid",
    description:
      "Scholaid orchestrates the academic journey through AI-driven insights, connecting students, faculty, and administrators in a high-performance ecosystem.",
    url: "https://scholaid.co",
    siteName: "Scholaid",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scholaid",
    description:
      "Scholaid orchestrates the academic journey through AI-driven insights, connecting students, faculty, and administrators in a high-performance ecosystem.",
    creator: "@scholaid",
  },
  metadataBase: new URL("https://scholaid.co"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};
