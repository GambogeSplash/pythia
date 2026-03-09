"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Serpent Logo SVG Paths ─────────────────────────────────────────────────
const SERPENT_PATHS = [
  "M45.9289 9.96148C55.0664 -1.96558 85.2671 -5.77327 98.2106 13.2613C116.221 24.1138 114.555 42.8088 111.368 52.5276C110.876 54.0275 109.241 54.7568 107.825 54.0598C103.402 51.883 96.7785 47.2356 93.1348 40.9245C88.6803 33.2091 87.8948 23.9202 88.0589 20.3671C86.5359 18.3365 81.9673 13.0075 70.0394 12.4999C51.7663 12.5 48.1861 26.8528 51.0048 47.5236C53.0811 62.7512 37.8075 67.3197 32.4798 66.812C29.9513 66.5711 22.8341 66.3039 22.3265 56.6583C21.9205 48.9419 27.7401 45.66 30.7007 44.9837C23.5945 48.7906 28.0625 63.7991 38.0613 56.6583C45.9289 51.0394 31.3024 29.0533 45.9289 9.96148ZM102.525 32.5497C100.563 32.5498 98.972 34.1405 98.972 36.1029C98.972 38.0652 100.563 39.6559 102.525 39.656C104.488 39.656 106.078 38.0652 106.078 36.1029C106.078 34.1405 104.487 32.5497 102.525 32.5497Z",
  "M103.795 66.2236C109.555 80.1005 97.7521 108.159 74.7959 109.851C56.3921 120.022 41.0351 109.231 34.2117 101.612C33.1587 100.436 33.3447 98.6557 34.6564 97.7777C38.753 95.0359 46.0894 91.6236 53.3769 91.6236C62.2856 91.6236 70.7224 95.5875 73.7176 97.5062C76.2373 97.2026 83.1371 95.9112 89.5409 85.8347C98.6775 70.0097 88.0377 59.7327 68.7268 51.8384C54.5012 46.0228 58.1816 30.5113 61.2851 26.151C62.7579 24.0819 66.5479 18.0517 75.1551 22.4349C82.0407 25.9416 81.9731 32.6224 81.0785 35.5245C81.3347 27.4669 66.103 23.832 67.2877 36.0617C68.2202 45.6845 94.5738 44.0108 103.795 66.2236ZM55.9344 103.943C56.9156 102.244 56.3333 100.071 54.6339 99.0896C52.9344 98.1085 50.7614 98.6907 49.7802 100.39C48.7991 102.09 49.3813 104.263 51.0807 105.244C52.7801 106.225 54.9532 105.643 55.9344 103.943Z",
  "M26.1369 88.2061C11.239 86.2563 -7.15882 62.0056 2.85378 41.2788C3.24708 20.2551 20.2707 12.3509 30.2808 10.2512C31.8257 9.92728 33.2749 10.9786 33.3794 12.5536C33.7055 17.4724 32.9925 25.532 29.3487 31.8431C24.8943 39.5583 17.2431 44.8828 14.0839 46.5174C13.0869 48.8514 10.7554 55.4725 16.28 66.0565C25.4166 81.8814 39.6367 77.8057 56.1287 65.0292C68.2781 55.6172 79.8713 66.5603 82.0955 71.4281C83.1511 73.7383 86.4782 80.0357 78.3787 85.298C71.8992 89.5077 66.1472 86.1088 64.0811 83.883C70.9311 88.1336 81.6948 76.7601 70.5113 71.6713C61.7115 67.6671 49.9842 91.3271 26.1369 88.2061ZM17.4008 27.8982C18.382 29.5975 20.5551 30.1798 22.2544 29.1987C23.9538 28.2175 24.5361 26.0444 23.555 24.345C22.5738 22.6456 20.4008 22.0633 18.7013 23.0445C17.0019 24.0257 16.4196 26.1987 17.4008 27.8982Z",
];

const MARKET_QUESTION = "Will AI pass the Turing test by 2027?";

// ─── Animated Chart (candlestick-style) ─────────────────────────────────────
function AnimatedChart({ show }: { show: boolean }) {
  // Generate candlestick-like bars
  const bars = useRef(
    Array.from({ length: 48 }, (_, i) => {
      const base = 50 + Math.sin(i * 0.3) * 20 + Math.sin(i * 0.7) * 10;
      const volatility = 5 + Math.random() * 15;
      const open = base + (Math.random() - 0.5) * volatility;
      const close = base + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * 8;
      const low = Math.min(open, close) - Math.random() * 8;
      const bullish = close > open;
      return { open, close, high, low, bullish };
    })
  ).current;

  const chartH = 120;
  const chartW = 600;
  const barW = chartW / bars.length;
  const maxVal = Math.max(...bars.map((b) => b.high));
  const minVal = Math.min(...bars.map((b) => b.low));
  const range = maxVal - minVal;
  const scale = (v: number) => chartH - ((v - minVal) / range) * chartH;

  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH}`}
      className="w-full"
      style={{ maxWidth: 600 }}
    >
      {bars.map((bar, i) => {
        const x = i * barW + barW * 0.3;
        const wickX = i * barW + barW * 0.5;
        const bodyTop = scale(Math.max(bar.open, bar.close));
        const bodyBottom = scale(Math.min(bar.open, bar.close));
        const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

        return (
          <motion.g
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={show ? { opacity: 1, scaleY: 1 } : {}}
            transition={{
              delay: i * 0.03,
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{ transformOrigin: `${wickX}px ${chartH}px` }}
          >
            {/* Wick */}
            <line
              x1={wickX}
              y1={scale(bar.high)}
              x2={wickX}
              y2={scale(bar.low)}
              stroke={bar.bullish ? "#00FF85" : "#FF3B3B"}
              strokeWidth={0.8}
              opacity={0.6}
            />
            {/* Body */}
            <rect
              x={x}
              y={bodyTop}
              width={barW * 0.4}
              height={bodyHeight}
              fill={bar.bullish ? "#00FF85" : "#FF3B3B"}
              opacity={bar.bullish ? 0.8 : 0.6}
              rx={0.5}
            />
          </motion.g>
        );
      })}
      {/* Glow line across the top of recent bars */}
      <motion.line
        x1={0}
        y1={scale(bars[bars.length - 1].close)}
        x2={chartW}
        y2={scale(bars[bars.length - 1].close)}
        stroke="#00FF85"
        strokeWidth={0.5}
        strokeDasharray="4 4"
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 0.3 } : {}}
        transition={{ delay: 1.5, duration: 0.5 }}
      />
    </svg>
  );
}

// ─── Oracle Painting Background ─────────────────────────────────────────────
function OracleBackground() {
  return (
    <div className="absolute inset-0">
      {/* Oracle painting — green-tinted dithered classical art */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/brand/oracle-wide.png)",
          filter: "brightness(0.35)",
        }}
      />
      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.95) 90%)",
        }}
      />
      {/* Scanline effect */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)",
        }}
      />
      {/* Subtle green tint overlay */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,255,133,0.06) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

// ─── SVG Path Draw Animation ────────────────────────────────────────────────
function SerpentLogo({ animate, className }: { animate: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 114 114"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {SERPENT_PATHS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="#00FF85"
          strokeWidth={1.5}
          initial={{ pathLength: 0, fillOpacity: 0 }}
          animate={
            animate
              ? {
                  pathLength: 1,
                  fillOpacity: 1,
                  fill: "#00FF85",
                }
              : {}
          }
          transition={{
            pathLength: {
              duration: 1.2,
              delay: i * 0.15,
              ease: [0.25, 0.46, 0.45, 0.94],
            },
            fillOpacity: {
              duration: 0.6,
              delay: 0.8 + i * 0.15,
              ease: "easeOut",
            },
          }}
        />
      ))}
    </svg>
  );
}

// ─── Typing Text ────────────────────────────────────────────────────────────
function TypingText({
  text,
  startDelay = 0,
  speed = 40,
  onComplete,
  className,
}: {
  text: string;
  startDelay?: number;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timeout);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }
    const timeout = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(timeout);
  }, [started, displayed, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="animate-pulse text-signal-green">|</span>
      )}
    </span>
  );
}

// ─── Probability Bar ────────────────────────────────────────────────────────
function ProbabilityBar({ show }: { show: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-center gap-6"
    >
      <div className="flex items-center gap-3">
        <span
          className="text-header-16 font-semibold text-signal-green"
          style={{ fontFamily: "var(--font-crimson-pro), serif" }}
        >
          YES
        </span>
        <div className="relative h-2.5 w-44 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #00FF85 0%, #00CC6A 100%)",
              boxShadow: "0 0 20px rgba(0,255,133,0.4)",
            }}
            initial={{ width: "0%" }}
            animate={show ? { width: "73%" } : {}}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
        <motion.span
          className="font-mono text-header-20 font-bold tabular-nums text-signal-green"
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ delay: 1.0 }}
        >
          0.73
        </motion.span>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="text-header-16 font-semibold text-[#FF3B3B]"
          style={{ fontFamily: "var(--font-crimson-pro), serif" }}
        >
          NO
        </span>
        <motion.span
          className="font-mono text-header-20 tabular-nums text-[#FF3B3B]/70"
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
        >
          0.27
        </motion.span>
      </div>
    </motion.div>
  );
}

// ─── Main Demo Page ─────────────────────────────────────────────────────────
export default function DemoPage() {
  const [phase, setPhase] = useState<"splash" | "leaving">("splash");
  const [logoAnimated, setLogoAnimated] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showProbability, setShowProbability] = useState(false);

  useEffect(() => {
    setLogoAnimated(true);
    // Start chart animation after logo draws
    const chartTimer = setTimeout(() => setShowChart(true), 600);
    return () => clearTimeout(chartTimer);
  }, []);

  const handleQuestionComplete = useCallback(() => {
    setTimeout(() => setShowProbability(true), 300);
  }, []);

  // After everything is shown, hold then transition out
  useEffect(() => {
    if (!showProbability) return;
    const timer = setTimeout(() => {
      setPhase("leaving");
      // Navigate to dashboard after exit animation
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 900);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showProbability]);

  const handleSkip = () => {
    if (phase === "leaving") return;
    setPhase("leaving");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  };

  return (
    <div
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black"
      onClick={handleSkip}
      style={{ cursor: "pointer" }}
    >
      {/* Dithered background */}
      <motion.div
        className="absolute inset-0"
        animate={phase === "leaving" ? { opacity: 0, scale: 1.1 } : { opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <OracleBackground />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        animate={
          phase === "leaving"
            ? { opacity: 0, scale: 0.92, filter: "blur(16px)", y: -30 }
            : { opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }
        }
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Serpent Logo with glow */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="relative mb-6"
        >
          <div
            className="absolute inset-0 blur-[80px]"
            style={{
              background: "radial-gradient(circle, rgba(0,255,133,0.3) 0%, transparent 70%)",
              transform: "scale(3)",
            }}
          />
          <SerpentLogo animate={logoAnimated} className="relative h-24 w-24" />
        </motion.div>

        {/* Brand name — PYTHIA in Crimson Pro */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="mb-2 text-display-32 font-medium uppercase tracking-[0.15em] text-white"
          style={{ fontFamily: "var(--font-crimson-pro), serif" }}
        >
          PYTHIA<span className="text-signal-green">.</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="mb-10 text-header-16 font-medium tracking-wide text-white/40"
          style={{ fontFamily: "var(--font-crimson-pro), serif" }}
        >
          The quant desk for prediction markets
        </motion.p>

        {/* Animated candlestick chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-10 w-full max-w-[560px] px-4"
        >
          <AnimatedChart show={showChart} />
        </motion.div>

        {/* Market question card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.5 }}
          className="rounded-[14px] border border-white/[0.06] bg-white/[0.03] px-8 py-5 backdrop-blur-md"
          style={{
            boxShadow:
              "0 0 0 1px rgba(0,255,133,0.06), 0 16px 48px -8px rgba(0,0,0,0.6), 0 0 60px -12px rgba(0,255,133,0.08)",
          }}
        >
          <p
            className="text-center text-header-20 font-medium text-white/90"
            style={{ fontFamily: "var(--font-crimson-pro), serif" }}
          >
            <TypingText
              text={MARKET_QUESTION}
              startDelay={2700}
              speed={35}
              onComplete={handleQuestionComplete}
            />
          </p>
          <div className="mt-4 flex justify-center">
            <ProbabilityBar show={showProbability} />
          </div>
        </motion.div>
      </motion.div>

      {/* Skip hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "leaving" ? 0 : 0.25 }}
        transition={{ delay: 3.5, duration: 0.5 }}
        className="absolute bottom-6 z-10 text-label-10 tracking-[0.2em] text-white/30"
        style={{ fontFamily: "var(--font-crimson-pro), serif" }}
      >
        Click anywhere to continue
      </motion.p>

      {/* Black fade overlay for transition */}
      <AnimatePresence>
        {phase === "leaving" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute inset-0 z-50 bg-black"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
