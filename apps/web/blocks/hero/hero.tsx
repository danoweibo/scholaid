"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
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

interface Breakpoint {
  isVertical: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

interface SlideProps {
  slide: SlideData;
  isActive: boolean;
  onClick: () => void;
  index: number;
  isVertical: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

interface IconPlaceholderProps {
  accent: string;
  accentSoft: string;
  accentBorder: string;
  iconPath: string;
  animKey: string;
}

interface SubjectImageProps {
  src: string;
  accent: string;
  animKey: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DURATION = 0.8;
const EASE = [0.4, 0, 0.2, 1] as const;
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
    imgSrc: "/images/9.png",
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
    imgSrc: "/images/5.png",
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
    imgSrc: "/images/7.png",
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
    imgSrc: "/images/1.png",
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useBreakpoint(): Breakpoint {
  const get = (): Breakpoint => ({
    isVertical: window.innerWidth <= 768,
    isMobile: window.innerWidth <= 480,
    isTablet: window.innerWidth > 480 && window.innerWidth <= 1024,
  });

  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window !== "undefined"
      ? get()
      : { isVertical: false, isMobile: false, isTablet: false },
  );

  useEffect(() => {
    const h = () => setBp(get());
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return bp;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function IconPlaceholder({
  accent,
  accentSoft,
  accentBorder,
  iconPath,
  animKey,
}: IconPlaceholderProps) {
  return (
    <motion.div
      key={animKey}
      initial={IMG_INITIAL}
      animate={IMG_ANIMATE}
      transition={IMG_SPRING}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "16px",
        border: `1.5px dashed ${accentBorder}`,
        background: accentSoft,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          border: `1px solid ${accent}18`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          border: `1px solid ${accent}0d`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: accentSoft,
          border: `1.5px solid ${accentBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
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
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "10px",
          fontWeight: 500,
          color: accent,
          opacity: 0.45,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          position: "relative",
          zIndex: 1,
        }}
      >
        Image placeholder
      </span>
    </motion.div>
  );
}

function SubjectImage({ src, accent, animKey }: SubjectImageProps) {
  return (
    <motion.div
      key={animKey}
      initial={IMG_INITIAL}
      animate={IMG_ANIMATE}
      transition={IMG_SPRING}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        filter: `drop-shadow(0 24px 48px ${accent}55)`,
      }}
    >
      <Image
        src={src}
        alt="subject"
        className="scale-180"
        fill
        style={{ objectFit: "contain", objectPosition: "center" }}
        priority
      />
    </motion.div>
  );
}

// ─── Slide ────────────────────────────────────────────────────────────────────

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

  const sizeStyle: React.CSSProperties = isVertical
    ? {
        flexGrow: isActive ? ACTIVE_FLEX : THUMB_FLEX,
        flexShrink: 0,
        flexBasis: "auto",
        minHeight: isActive
          ? isMobile
            ? "220px"
            : "280px"
          : isMobile
            ? "48px"
            : "58px",
        width: "100%",
      }
    : {
        flexGrow: isActive ? ACTIVE_FLEX : THUMB_FLEX,
        flexShrink: 0,
        flexBasis: "auto",
        height: "100%",
      };

  const pad = isMobile
    ? "1.25rem 1.1rem 1.1rem"
    : isTablet
      ? "2rem 1.6rem 1.8rem 2rem"
      : "3rem 2rem 2.5rem 2.5rem";

  const borderRadius = isMobile ? "14px" : isTablet ? "18px" : "20px";
  const stackAxis = isMobile || isTablet;

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
      }}
      transition={{ duration: DURATION, ease: EASE }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: slide.glow,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: isActive
            ? "linear-gradient(to top, rgba(1,14,30,0.75) 0%, rgba(1,14,30,0.08) 52%, transparent 100%)"
            : "rgba(1,14,30,0.48)",
          transition: "background 0.5s ease",
        }}
      />

      {/* Noise */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          opacity: 0.03,
          pointerEvents: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      {/* ── ACTIVE content ── */}
      {isActive && (
        <motion.div
          key={`content-${slide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: stackAxis ? "column" : "row",
            alignItems: stackAxis ? "stretch" : "flex-end",
          }}
        >
          {/* Text block */}
          <div
            style={{
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: stackAxis ? "auto" : "52%",
              padding: pad,
              display: "flex",
              flexDirection: "column",
              justifyContent: stackAxis ? "flex-start" : "flex-end",
              order: 0,
            }}
          >
            {/* Icon pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                marginBottom: isMobile ? "9px" : isTablet ? "12px" : "16px",
                width: "fit-content",
              }}
            >
              <div
                style={{
                  width: isMobile ? "28px" : "32px",
                  height: isMobile ? "28px" : "32px",
                  borderRadius: "10px",
                  background: slide.accentSoft,
                  border: `1px solid ${slide.accentBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: isMobile ? "10px" : "11px",
                  fontWeight: 600,
                  color: slide.accent,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
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
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: isMobile
                  ? "clamp(22px, 7.5vw, 30px)"
                  : isTablet
                    ? "clamp(28px, 4vw, 44px)"
                    : "clamp(26px, 3vw, 50px)",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.06,
                marginBottom: isMobile ? "8px" : isTablet ? "10px" : "14px",
                whiteSpace: "pre-line",
                letterSpacing: "-0.025em",
              }}
            >
              {slide.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              key={`p-${slide.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.46, ease: "easeOut" }}
              style={{
                color: "rgba(180,215,235,0.68)",
                fontSize: isMobile
                  ? "clamp(12px, 3.2vw, 14px)"
                  : isTablet
                    ? "clamp(13px, 1.5vw, 15px)"
                    : "clamp(13px, 1vw, 15px)",
                lineHeight: 1.35,
                maxWidth: isMobile ? "100%" : isTablet ? "420px" : "360px",
                fontWeight: 300,
                marginBottom: isMobile ? "12px" : isTablet ? "16px" : "2rem",
              }}
            >
              {slide.sub}
            </motion.p>

            {/* Progress dots */}
            <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
              {slides.map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    height: "3px",
                    borderRadius: "100px",
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
            style={{
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: "0%",
              alignSelf: "stretch",
              position: "relative",
              padding: isMobile
                ? "0 0.8rem 0.8rem"
                : isTablet
                  ? "0 1.2rem 1.2rem"
                  : "1.5rem 1.5rem 0 0",
              display: "flex",
              alignItems: stackAxis ? "stretch" : "flex-end",
              justifyContent: "center",
              overflow: "visible",
              minHeight: isMobile ? "140px" : isTablet ? "200px" : "unset",
              order: 1,
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

      {/* ── THUMBNAIL content ── */}
      {!isActive && (
        <motion.div
          key={`thumb-${slide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: THUMB_DELAY }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: isVertical ? "row" : "column",
            justifyContent: isVertical ? "flex-start" : "flex-end",
            alignItems: "center",
            padding: isVertical ? "0 0 0 16px" : "0 0 18px",
            gap: "8px",
          }}
        >
          {isVertical ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "8px",
                  background: slide.accentSoft,
                  border: `1px solid ${slide.accentBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                style={{
                  fontFamily: "'Syne', sans-serif",
                  color: "rgba(180,215,235,0.5)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {slide.tag}
              </span>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "9px",
                  background: slide.accentSoft,
                  border: `1px solid ${slide.accentBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                style={{
                  width: "3px",
                  height: "22px",
                  borderRadius: "100px",
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

// ─── Root ─────────────────────────────────────────────────────────────────────

export function HeroSlider() {
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

  const wrapperStyle: React.CSSProperties = {
    width: isVertical ? "100%" : isTablet ? "92%" : "83.333%",
    maxWidth: "1600px",
  };

  const trackStyle: React.CSSProperties = isVertical
    ? {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
        height: `calc(100vh - ${isMobile ? "52px" : "56px"})`,
        padding: `0 ${isMobile ? "8px" : "10px"} ${isMobile ? "8px" : "10px"}`,
      }
    : {
        display: "flex",
        flexDirection: "row",
        gap: "10px",
        width: "100%",
        height: isTablet ? "72vh" : "82vh",
        minHeight: isTablet ? "460px" : "500px",
        maxHeight: isTablet ? undefined : "860px",
      };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: isVertical ? "flex-start" : "center",
        justifyContent: "center",
        paddingTop: isVertical ? (isMobile ? "52px" : "56px") : undefined,
      }}
    >
      <div style={wrapperStyle}>
        <div style={trackStyle}>
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
    </div>
  );
}
