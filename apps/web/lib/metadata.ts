import type { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: "Daniel Oweibo — Fullstack Platform Developer",
  description:
    "Fullstack developer obsessed with building platforms and scaling infrastructure. React, Next.js, Golang, Node.js and more.",
  keywords: ["fullstack developer", "open to work"],
  authors: [{ name: "Daniel Oweibo" }],
  creator: "Daniel Oweibo",
  openGraph: {
    title: "Daniel Oweibo — Fullstack Developer",
    description:
      "Fullstack developer obsessed with building platforms and scaling infrastructure.",
    url: "https://dvnlcorp.com",
    siteName: "Daniel Oweibo",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniel Oweibo — Fullstack Engineer",
    description:
      "Fullstack developer obsessed with building platforms and scaling infrastructure.",
    creator: "@danoweibo",
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
