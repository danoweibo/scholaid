"use client";

/**
 * HeroSlider.tsx
 *
 * Next.js 13+ / App Router compatible ("use client" directive).
 * Dependencies:
 *   npm install framer-motion
 *
 * Fonts — add to your layout.tsx / _app.tsx (or next/font/google):
 *   import { Syne, DM_Sans } from "next/font/google";
 *   const syne   = Syne({ subsets: ["latin"], variable: "--font-syne",    weight: ["400","600","700","800"] });
 *   const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["300","400","500"] });
 *   // Apply both variables to <body> className
 *
 * Tailwind config — add to tailwind.config.ts extend.fontFamily:
 *   syne:    ["var(--font-syne)",    "sans-serif"],
 *   "dm-sans": ["var(--font-dm-sans)", "sans-serif"],
 *
 * Usage:
 *   <HeroSlider />
 *
 * The component fills its container. Wrap it in whatever
 * full-screen container you need in your page, e.g.:
 *   <main className="w-full min-h-screen bg-[#061220]">
 *     <HeroSlider />
 *   </main>
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlideData {
  id: number;
  tag: string;
  title: string;
  sub: string;
  bg: string;
  glow: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  iconPath: string;
  imgSrc?: string;
}

// ─── Slide data ───────────────────────────────────────────────────────────────

const slides: SlideData[] = [
  {
    id: 0,
    tag: "Featured",
    title: "The Future\nof Interface",
    sub: "Crafting digital experiences that blur the line between design and technology.",
    bg: "linear-gradient(135deg, #0a3a6e 0%, #0d5499 45%, #0b6e8a 100%)",
    glow: "radial-gradient(ellipse 60% 55% at 80% 15%, rgba(0,210,230,0.28) 0%, transparent 70%)",
    accent: "#00d4e8",
    accentSoft: "rgba(0,212,232,0.18)",
    accentBorder: "rgba(0,212,232,0.38)",
    iconPath: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    id: 1,
    tag: "Design",
    title: "Motion\nThat Speaks",
    sub: "Every pixel animated with purpose. Every transition tells a story worth feeling.",
    bg: "linear-gradient(135deg, #0e3d6a 0%, #145c96 40%, #0e6d8c 100%)",
    glow: "radial-gradient(ellipse 55% 60% at 75% 20%, rgba(0,230,255,0.26) 0%, transparent 65%)",
    accent: "#00eaff",
    accentSoft: "rgba(0,234,255,0.15)",
    accentBorder: "rgba(0,234,255,0.32)",
    iconPath: "M5 3l14 9-14 9V3z",
  },
  {
    id: 2,
    tag: "Explore",
    title: "Bold &\nBoundless",
    sub: "Pushing creative limits with fearless design choices and refined execution.",
    bg: "linear-gradient(135deg, #0a2e52 0%, #0f4275 45%, #0c5a7a 100%)",
    glow: "radial-gradient(ellipse 65% 50% at 78% 18%, rgba(0,180,220,0.30) 0%, transparent 68%)",
    accent: "#00c8e0",
    accentSoft: "rgba(0,200,224,0.15)",
    accentBorder: "rgba(0,200,224,0.34)",
    iconPath: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    id: 3,
    tag: "Studio",
    title: "Crafted\nWith Care",
    sub: "Where attention to detail becomes the defining quality of exceptional work.",
    bg: "linear-gradient(135deg, #0a5570 0%, #0d6e8a 45%, #0a3f6b 100%)",
    glow: "radial-gradient(ellipse 58% 52% at 82% 14%, rgba(0,255,240,0.24) 0%, transparent 65%)",
    accent: "#33f5e8",
    accentSoft: "rgba(51,245,232,0.13)",
    accentBorder: "rgba(51,245,232,0.32)",
    iconPath:
      "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
];

// ─── Animation constants ──────────────────────────────────────────────────────

const SLIDE_TRANSITION = { duration: 0.8, ease: [0.4, 0, 0.2, 1] as const };
const AUTO_INTERVAL = 3500;
const THUMB_DELAY = 0.85;

/** Diagonal spring — enters from bottom-right */
const IMG_SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 20,
  mass: 1.0,
  delay: 0.38,
};
const IMG_INITIAL = { opacity: 0, scale: 0.62, x: 60, y: 55, rotate: 6 };
const IMG_ANIMATE = { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 };

// ─── Noise SVG (data URI) ─────────────────────────────────────────────────────

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// ─── Breakpoint hook ──────────────────────────────────────────────────────────

interface Breakpoint {
  isVertical: boolean; // ≤ 768 → stacked layout
  isMobile: boolean; // ≤ 480
  isTablet: boolean; // 481–1024
}

function useBreakpoint(): Breakpoint {
  const get = (): Breakpoint => ({
    isVertical: window.innerWidth <= 768,
    isMobile: window.innerWidth <= 480,
    isTablet: window.innerWidth > 480 && window.innerWidth <= 1024,
  });

  const [bp, setBp] = useState<Breakpoint>({
    isVertical: false,
    isMobile: false,
    isTablet: false,
  });

  useEffect(() => {
    setBp(get());
    const handler = () => setBp(get());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return bp;
}

// ─── SlideIcon (SVG icon used in both active header & thumbnail) ──────────────

interface SlideIconProps {
  iconPath: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  size?: number;
  iconSize?: number;
  radius?: number;
}

function SlideIcon({
  iconPath,
  accent,
  accentSoft,
  accentBorder,
  size = 32,
  iconSize = 15,
  radius = 10,
}: SlideIconProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: accentSoft,
        border: `1px solid ${accentBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={accent}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconPath} />
      </svg>
    </div>
  );
}

// ─── IconPlaceholder (shown when no imgSrc) ───────────────────────────────────

interface PlaceholderProps {
  accent: string;
  accentSoft: string;
  accentBorder: string;
  iconPath: string;
  animKey: string;
}

function IconPlaceholder({
  accent,
  accentSoft,
  accentBorder,
  iconPath,
  animKey,
}: PlaceholderProps) {
  return (
    <motion.div
      key={animKey}
      initial={IMG_INITIAL}
      animate={IMG_ANIMATE}
      transition={IMG_SPRING}
      className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden"
      style={{
        borderRadius: 16,
        border: `1.5px dashed ${accentBorder}`,
        background: accentSoft,
      }}
    >
      {/* Decorative rings */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 180,
          height: 180,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          border: `1px solid ${accent}18`,
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          border: `1px solid ${accent}0d`,
        }}
      />

      {/* Icon circle */}
      <div
        className="relative z-10 flex items-center justify-center rounded-full"
        style={{
          width: 64,
          height: 64,
          background: accentSoft,
          border: `1.5px solid ${accentBorder}`,
        }}
      >
        <svg
          width={26}
          height={26}
          viewBox="0 0 24 24"
          fill="none"
          stroke={accent}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.75 }}
        >
          <path d={iconPath} />
        </svg>
      </div>

      <span
        className="font-dm-sans relative z-10 tracking-widest uppercase"
        style={{ fontSize: 10, color: accent, opacity: 0.45, fontWeight: 500 }}
      >
        Image placeholder
      </span>
    </motion.div>
  );
}

// ─── SubjectImage ─────────────────────────────────────────────────────────────

interface SubjectImageProps {
  src: string;
  accent: string;
  animKey: string;
}

function SubjectImage({ src, accent, animKey }: SubjectImageProps) {
  return (
    <motion.img
      key={animKey}
      src={src}
      alt="slide subject"
      initial={IMG_INITIAL}
      animate={IMG_ANIMATE}
      transition={IMG_SPRING}
      className="h-full w-full object-contain object-bottom"
      style={{ filter: `drop-shadow(0 24px 48px ${accent}55)` }}
    />
  );
}

// ─── Individual Slide ─────────────────────────────────────────────────────────

interface SlideProps {
  slide: SlideData;
  isActive: boolean;
  index: number; // currently active index (for dots)
  onClick: () => void;
  isVertical: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

function Slide({
  slide,
  isActive,
  index,
  onClick,
  isVertical,
  isMobile,
  isTablet,
}: SlideProps) {
  const isStacked = isMobile || isTablet; // column layout

  /* Flex grow values */
  const activeFlex = isVertical ? 5 : isTablet ? 5.5 : 5;
  const thumbFlex = isVertical ? 0.3 : isTablet ? 0.45 : 0.55;

  /* Padding inside active card text block */
  const textPad = isMobile
    ? "1.25rem 1.1rem 1.1rem"
    : isTablet
      ? "2rem 1.6rem 1.8rem 2rem"
      : "3rem 2rem 2.5rem 2.5rem";

  const borderRadius = isMobile ? 14 : isTablet ? 18 : 20;

  /* Inline size styles (flex growth can't be done cleanly in Tailwind with dynamic values) */
  const sizeStyle: React.CSSProperties = isVertical
    ? {
        flex: isActive ? activeFlex : thumbFlex,
        minHeight: isActive ? (isMobile ? 220 : 280) : isMobile ? 48 : 58,
        width: "100%",
      }
    : {
        flex: isActive ? activeFlex : thumbFlex,
        height: "100%",
      };

  return (
    <motion.div
      layout
      onClick={onClick}
      transition={SLIDE_TRANSITION}
      style={{
        ...sizeStyle,
        position: "relative",
        borderRadius,
        overflow: "hidden",
        cursor: isActive ? "default" : "pointer",
        background: slide.bg,
        flexShrink: 0,
      }}
    >
      {/* Cyan glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: slide.glow, zIndex: 0 }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          zIndex: 1,
          background: isActive
            ? "linear-gradient(to top, rgba(1,14,30,0.75) 0%, rgba(1,14,30,0.08) 52%, transparent 100%)"
            : "rgba(1,14,30,0.48)",
        }}
      />

      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 1,
          opacity: 0.03,
          backgroundImage: NOISE_BG,
          backgroundSize: "180px 180px",
        }}
      />

      {/* ── ACTIVE CONTENT ── */}
      {isActive && (
        <motion.div
          key={`content-${slide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          className="absolute inset-0"
          style={{
            zIndex: 2,
            display: "flex",
            flexDirection: isStacked ? "column" : "row",
            alignItems: isStacked ? "stretch" : "flex-end",
          }}
        >
          {/* Text block */}
          <div
            style={{
              flex: isStacked ? "0 0 auto" : "0 0 52%",
              padding: textPad,
              display: "flex",
              flexDirection: "column",
              justifyContent: isStacked ? "flex-start" : "flex-end",
            }}
          >
            {/* Icon + tag row */}
            <div
              className="flex items-center gap-2"
              style={{
                marginBottom: isMobile ? 9 : isTablet ? 12 : 16,
                width: "fit-content",
              }}
            >
              <SlideIcon
                iconPath={slide.iconPath}
                accent={slide.accent}
                accentSoft={slide.accentSoft}
                accentBorder={slide.accentBorder}
                size={isMobile ? 28 : 32}
                iconSize={isMobile ? 13 : 15}
                radius={isMobile ? 8 : 10}
              />
              <span
                className="font-syne tracking-widest uppercase"
                style={{
                  fontSize: isMobile ? 10 : 11,
                  fontWeight: 600,
                  color: slide.accent,
                  opacity: 0.75,
                }}
              >
                {slide.tag}
              </span>
            </div>

            {/* Title */}
            <motion.h2
              key={`h-${slide.id}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.36, ease: "easeOut" }}
              className="font-syne whitespace-pre-line text-white"
              style={{
                fontSize: isMobile
                  ? "clamp(22px,7.5vw,30px)"
                  : isTablet
                    ? "clamp(28px,4vw,44px)"
                    : "clamp(26px,3vw,50px)",
                fontWeight: 800,
                lineHeight: 1.06,
                letterSpacing: "-0.025em",
                marginBottom: isMobile ? 8 : isTablet ? 10 : 14,
              }}
            >
              {slide.title}
            </motion.h2>

            {/* Description — tight leading */}
            <motion.p
              key={`p-${slide.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.46, ease: "easeOut" }}
              className="font-dm-sans"
              style={{
                color: "rgba(180,215,235,0.68)",
                fontSize: isMobile
                  ? "clamp(12px,3.2vw,14px)"
                  : isTablet
                    ? "clamp(13px,1.5vw,15px)"
                    : "clamp(13px,1vw,15px)",
                lineHeight: 1.35,
                fontWeight: 300,
                maxWidth: isMobile ? "100%" : isTablet ? 420 : 360,
                marginBottom: isMobile ? 12 : isTablet ? 16 : 32,
              }}
            >
              {slide.sub}
            </motion.p>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{
                    height: 3,
                    background:
                      i === index ? slide.accent : "rgba(255,255,255,0.2)",
                  }}
                  animate={{
                    width: i === index ? 26 : 9,
                    opacity: i === index ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>

          {/* Image / placeholder block */}
          <div
            style={{
              flex: 1,
              position: "relative",
              padding: isMobile
                ? "0 0.8rem 0.8rem"
                : isTablet
                  ? "0 1.2rem 1.2rem"
                  : "1.5rem 1.5rem 0 0",
              display: "flex",
              alignItems: isStacked ? "stretch" : "flex-end",
              justifyContent: "center",
              overflow: "visible",
              minHeight: isMobile ? 140 : isTablet ? 200 : undefined,
            }}
          >
            {slide.imgSrc ? (
              <SubjectImage
                src={slide.imgSrc}
                accent={slide.accent}
                animKey={`img-${slide.id}`}
              />
            ) : (
              <IconPlaceholder
                accent={slide.accent}
                accentSoft={slide.accentSoft}
                accentBorder={slide.accentBorder}
                iconPath={slide.iconPath}
                animKey={`ph-${slide.id}`}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* ── THUMBNAIL ── */}
      {!isActive && (
        <motion.div
          key={`thumb-${slide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: THUMB_DELAY }}
          className="absolute inset-0"
          style={{
            zIndex: 2,
            display: "flex",
            flexDirection: isVertical ? "row" : "column",
            justifyContent: isVertical ? "flex-start" : "flex-end",
            alignItems: "center",
            padding: isVertical ? "0 0 0 16px" : "0 0 18px",
            gap: 8,
          }}
        >
          {isVertical ? (
            <div className="flex items-center gap-2">
              <SlideIcon
                iconPath={slide.iconPath}
                accent={slide.accent}
                accentSoft={slide.accentSoft}
                accentBorder={slide.accentBorder}
                size={24}
                iconSize={11}
                radius={8}
              />
              <span
                className="font-syne tracking-widest uppercase"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(180,215,235,0.5)",
                }}
              >
                {slide.tag}
              </span>
            </div>
          ) : (
            <>
              <SlideIcon
                iconPath={slide.iconPath}
                accent={slide.accent}
                accentSoft={slide.accentSoft}
                accentBorder={slide.accentBorder}
                size={26}
                iconSize={12}
                radius={9}
              />
              <div
                className="rounded-full"
                style={{
                  width: 3,
                  height: 22,
                  background: `${slide.accent}88`,
                }}
              />
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── HeroSlider (root) ────────────────────────────────────────────────────────

export default function HeroSlider() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { isVertical, isMobile, isTablet } = useBreakpoint();

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((p) => (p + 1) % slides.length);
    }, AUTO_INTERVAL);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  return (
    /**
     * Outer shell — mirrors the CSS in the HTML version:
     *   - Desktop: centred, 83% wide, max 1600px
     *   - Mobile (≤768): full width, full height minus navbar (56px top padding on #root)
     *
     * Add `pt-14` (56px) to the page-level wrapper to simulate the navbar offset,
     * or wire it up to your actual navbar height via a CSS variable.
     */
    <div
      className={[
        // Desktop / tablet wrapper
        "mx-auto w-full",
        // On mobile occupy full width; on larger screens constrain
        "md:w-[83.333%] md:max-w-[1600px]",
      ].join(" ")}
    >
      <div
        className={[
          "flex gap-2.5",
          // Mobile: column, full viewport height minus navbar
          isVertical
            ? "h-[calc(100vh-56px)] flex-col px-2.5 pb-2.5"
            : "h-[82vh] max-h-[860px] min-h-[500px] flex-row",
          // Tablet adjustment
          !isVertical && isTablet ? "!h-[72vh] !min-h-[460px]" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {slides.map((slide, i) => (
          <Slide
            key={slide.id}
            slide={slide}
            index={active}
            isActive={i === active}
            onClick={() => {
              if (i !== active) {
                setActive(i);
                startTimer();
              }
            }}
            isVertical={isVertical}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        ))}
      </div>
    </div>
  );
}
