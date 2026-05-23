import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Noto_Sans, Instrument_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  apfelGrotezk,
  apfelGrotezkFett,
  apfelGrotezkMittel,
  momoTrustDisplay,
  patuaOne,
  protestStrike,
  sketchup,
} from "@/lib/fonts";
import { siteMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { LenisProvider } from "@/providers/lenis";

const instrumentSansHeading = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });
export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans",
        notoSans.variable,
        instrumentSansHeading.variable,
      )}
    >
      <body
        className={` ${apfelGrotezk.variable} ${apfelGrotezkFett.variable} ${apfelGrotezkMittel.variable} ${momoTrustDisplay.variable} ${patuaOne.variable} ${protestStrike.variable} ${sketchup.variable} antialiased`}
      >
        <TooltipProvider>
          <LenisProvider>{children}</LenisProvider>
        </TooltipProvider>
        <Toaster />
        {/* <GooeyToaster /> */}

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
