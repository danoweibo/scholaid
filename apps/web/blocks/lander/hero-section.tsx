"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
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

interface Breakpoint {
  isVertical: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const DURATION = 0.8;
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const AUTO_INTERVAL = 3500;
const THUMB_DELAY = DURATION + 0.05;

const IMG_SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 20,
  mass: 1.0,
  delay: 0.38,
};
const IMG_INITIAL = { opacity: 0, scale: 0.62, x: 60, y: 55, rotate: 6 };
const IMG_ANIMATE = { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 };

/* ─────────────────────────────────────────────
   Slide data
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Noise SVG (data URI — unchanged from source)
───────────────────────────────────────────── */
const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* ─────────────────────────────────────────────
   Hook: breakpoint
───────────────────────────────────────────── */
function useBreakpoint(): Breakpoint {
  const get = (): Breakpoint => ({
    isVertical: window.innerWidth <= 768,
    isMobile: window.innerWidth <= 480,
    isTablet: window.innerWidth > 480 && window.innerWidth <= 1024,
  });
  const [bp, setBp] = useState<Breakpoint>(get);
  useEffect(() => {
    const h = () => setBp(get());
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return bp;
}

/* ─────────────────────────────────────────────
   IconPlaceholder
───────────────────────────────────────────── */
function IconPlaceholder({
  accent,
  accentSoft,
  accentBorder,
  iconPath,
  animKey,
}: {
  accent: string;
  accentSoft: string;
  accentBorder: string;
  iconPath: string;
  animKey: string;
}) {
  return (
    <motion.div
      key={animKey}
      initial={IMG_INITIAL}
      animate={IMG_ANIMATE}
      transition={IMG_SPRING}
      className="relative flex flex-col items-center justify-center gap-3.5 overflow-hidden rounded-2xl"
      style={{
        width: "100%",
        height: "100%",
        border: `1.5px dashed ${accentBorder}`,
        background: accentSoft,
      }}
    >
      {/* Decorative rings */}
      <div
        className="absolute rounded-full"
        style={{
          width: 180,
          height: 180,
          border: `1px solid ${accent}18`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          border: `1px solid ${accent}0d`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
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
        className="font-apfel-mittel relative z-10 text-[10px] font-medium tracking-widest uppercase"
        style={{ color: accent, opacity: 0.45 }}
      >
        Image placeholder
      </span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   SubjectImage
───────────────────────────────────────────── */
function SubjectImage({
  src,
  accent,
  animKey,
}: {
  src: string;
  accent: string;
  iconPath: string;
  animKey: string;
}) {
  return (
    <motion.img
      key={animKey}
      src={src}
      alt="subject"
      initial={IMG_INITIAL}
      animate={IMG_ANIMATE}
      transition={IMG_SPRING}
      className="h-full w-full object-contain object-bottom"
      style={{ filter: `drop-shadow(0 24px 48px ${accent}55)` }}
    />
  );
}

/* ─────────────────────────────────────────────
   Slide
───────────────────────────────────────────── */
interface SlideProps {
  slide: SlideData;
  isActive: boolean;
  onClick: () => void;
  index: number;
  isVertical: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

function Slide({
  slide,
  isActive,
  onClick,
  index,
  isVertical,
  isMobile,
  isTablet,
}: SlideProps) {
  const ACTIVE_FLEX = isVertical ? 5 : isTablet ? 5.5 : 5;
  const THUMB_FLEX = isVertical ? 0.3 : isTablet ? 0.45 : 0.55;

  const sizeStyle = isVertical
    ? {
        flex: isActive ? ACTIVE_FLEX : THUMB_FLEX,
        minHeight: isActive
          ? isMobile
            ? "220px"
            : "280px"
          : isMobile
            ? "48px"
            : "58px",
        width: "100%",
      }
    : { flex: isActive ? ACTIVE_FLEX : THUMB_FLEX, height: "100%" };

  const pad = isMobile
    ? "1.25rem 1.1rem 1.1rem"
    : isTablet
      ? "2rem 1.6rem 1.8rem 2rem"
      : "3rem 2rem 2.5rem 2.5rem";

  const isStackedLayout = isMobile || isTablet;
  const borderRadius = isMobile ? "14px" : isTablet ? "18px" : "20px";

  return (
    <motion.div
      layout
      onClick={onClick}
      style={{
        ...sizeStyle,
        position: "relative",
        borderRadius,
        overflow: "hidden",
        cursor: isActive ? "default" : "pointer",
        background: slide.bg,
        flexShrink: 0,
      }}
      transition={{ duration: DURATION, ease: EASE }}
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ backgroundImage: slide.glow }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 z-1 transition-[background] duration-500 ease-in-out"
        style={{
          background: isActive
            ? "linear-gradient(to top, rgba(1,14,30,0.75) 0%, rgba(1,14,30,0.08) 52%, transparent 100%)"
            : "rgba(1,14,30,0.48)",
        }}
      />

      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 z-1 opacity-[0.03]"
        style={{ backgroundImage: NOISE_BG, backgroundSize: "180px 180px" }}
      />

      {/* ── ACTIVE ── */}
      {isActive && (
        <motion.div
          key={"content-" + slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          className="absolute inset-0 z-2 flex"
          style={{
            flexDirection: isStackedLayout ? "column" : "row",
            alignItems: isStackedLayout ? "stretch" : "flex-end",
          }}
        >
          {/* Text block */}
          <div
            className="flex flex-col"
            style={{
              flex: isStackedLayout ? "0 0 auto" : "0 0 52%",
              padding: pad,
              justifyContent: isStackedLayout ? "flex-start" : "flex-end",
              order: 0,
            }}
          >
            {/* Icon pill */}
            <div
              className="mb-4 inline-flex w-fit items-center gap-1.75"
              style={{
                marginBottom: isMobile ? "9px" : isTablet ? "12px" : "16px",
              }}
            >
              <div
                className="flex items-center justify-center rounded-[10px]"
                style={{
                  width: isMobile ? 28 : 32,
                  height: isMobile ? 28 : 32,
                  background: slide.accentSoft,
                  border: `1px solid ${slide.accentBorder}`,
                }}
              >
                <svg
                  width={isMobile ? 13 : 15}
                  height={isMobile ? 13 : 15}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={slide.accent}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={slide.iconPath} />
                </svg>
              </div>
              <span
                className="font-patua text-[11px] font-semibold tracking-widest uppercase"
                style={{
                  color: slide.accent,
                  opacity: 0.75,
                  fontSize: isMobile ? "10px" : "11px",
                }}
              >
                {slide.tag}
              </span>
            </div>

            {/* Title */}
            <motion.h2
              key={"h-" + slide.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.36, ease: "easeOut" }}
              className="font-patua leading-[1.06] font-extrabold tracking-tight whitespace-pre-line text-white"
              style={{
                fontSize: isMobile
                  ? "clamp(22px,7.5vw,30px)"
                  : isTablet
                    ? "clamp(28px,4vw,44px)"
                    : "clamp(26px,3vw,50px)",
                marginBottom: isMobile ? "8px" : isTablet ? "10px" : "14px",
              }}
            >
              {slide.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              key={"p-" + slide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.46, ease: "easeOut" }}
              className="font-apfel-mittel font-light"
              style={{
                color: "rgba(180,215,235,0.68)",
                fontSize: isMobile
                  ? "clamp(12px,3.2vw,14px)"
                  : isTablet
                    ? "clamp(13px,1.5vw,15px)"
                    : "clamp(13px,1vw,15px)",
                lineHeight: 1.35,
                maxWidth: isMobile ? "100%" : isTablet ? "420px" : "360px",
                marginBottom: isMobile ? "12px" : isTablet ? "16px" : "2rem",
              }}
            >
              {slide.sub}
            </motion.p>

            {/* Progress dots */}
            <div className="flex items-center gap-1.75">
              {slides.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-0.75 rounded-full"
                  style={{
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

          {/* Image block */}
          <div
            className="relative flex justify-center overflow-visible"
            style={{
              flex: 1,
              alignSelf: "stretch",
              padding: isMobile
                ? "0 0.8rem 0.8rem"
                : isTablet
                  ? "0 1.2rem 1.2rem"
                  : "1.5rem 1.5rem 0 0",
              alignItems: isStackedLayout ? "stretch" : "flex-end",
              minHeight: isMobile ? "140px" : isTablet ? "200px" : undefined,
              order: 1,
            }}
          >
            {slide.imgSrc ? (
              <SubjectImage
                src={slide.imgSrc}
                accent={slide.accent}
                iconPath={slide.iconPath}
                animKey={"img-" + slide.id}
              />
            ) : (
              <IconPlaceholder
                accent={slide.accent}
                accentSoft={slide.accentSoft}
                accentBorder={slide.accentBorder}
                iconPath={slide.iconPath}
                animKey={"ph-" + slide.id}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* ── THUMBNAIL ── */}
      {!isActive && (
        <motion.div
          key={"thumb-" + slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: THUMB_DELAY }}
          className="absolute inset-0 z-2 flex items-center"
          style={{
            flexDirection: isVertical ? "row" : "column",
            justifyContent: isVertical ? "flex-start" : "flex-end",
            padding: isVertical ? "0 0 0 16px" : "0 0 18px",
            gap: 8,
          }}
        >
          {isVertical ? (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 24,
                  height: 24,
                  background: slide.accentSoft,
                  border: `1px solid ${slide.accentBorder}`,
                }}
              >
                <svg
                  width={11}
                  height={11}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={slide.accent}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={slide.iconPath} />
                </svg>
              </div>
              <span
                className="font-patua text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: "rgba(180,215,235,0.5)" }}
              >
                {slide.tag}
              </span>
            </div>
          ) : (
            <>
              <div
                className="flex items-center justify-center rounded-[9px]"
                style={{
                  width: 26,
                  height: 26,
                  background: slide.accentSoft,
                  border: `1px solid ${slide.accentBorder}`,
                }}
              >
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={slide.accent}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={slide.iconPath} />
                </svg>
              </div>
              <div
                className="w-0.75 rounded-full"
                style={{ height: 22, background: `${slide.accent}88` }}
              />
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   HeroSection (root export)
───────────────────────────────────────────── */
export default function HeroSection() {
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
    /*
     * .hero-wrapper  →  w-[83.333%] max-w-[1600px]
     *   tablet override via inline style (Tailwind can't express the exact
     *   1024/769 media query with arbitrary values at utility level)
     *
     * We keep the tiny remaining responsive overrides in a <style> tag
     * because Tailwind's JIT can't generate @media blocks at runtime from
     * arbitrary breakpoint values — everything else is pure Tailwind.
     */
    <>
      <style>{`
        @media (max-width: 1024px) and (min-width: 769px) {
          .hero-wrapper { width: 92%; }
          .slider-track { height: 72vh; min-height: 460px; }
        }
        @media (max-width: 768px) {
          .hero-wrapper { width: 100%; padding: 0; }
          .slider-track {
            flex-direction: column;
            height: calc(100vh - 56px);
            min-height: unset;
            max-height: unset;
            gap: 6px;
            padding: 0 10px 10px;
          }
        }
        @media (max-width: 480px) {
          .slider-track { height: calc(100vh - 52px); padding: 0 8px 8px; }
        }
      `}</style>

      <div className="hero-wrapper w-[83.333%] max-w-400">
        <div
          className="slider-track flex flex-row gap-2.5"
          style={{
            width: "100%",
            height: "82vh",
            minHeight: "500px",
            maxHeight: "860px",
          }}
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
    </>
  );
}
