"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// ── Animated Number ──
// Smoothly counts between values with color flash on change
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  flashUp = "text-signal-green",
  flashDown = "text-signal-red",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  flashUp?: string;
  flashDown?: string;
}) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value === prevValue.current) return;
    const direction = value > prevValue.current ? "up" : "down";
    setFlash(direction);
    prevValue.current = value;

    const duration = 400;
    const start = display;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(start + diff * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    const timer = setTimeout(() => setFlash(null), 500);
    return () => clearTimeout(timer);
  }, [value]);

  const flashClass = flash === "up" ? flashUp : flash === "down" ? flashDown : "";

  return (
    <span className={`${className} ${flashClass} transition-colors duration-300`}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}

// ── Stagger Container ──
// Staggers children animation on mount
const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function StaggerList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ── Fade In on Scroll ──
// Fades in when element enters viewport
export function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Draw SVG Path ──
// Animates an SVG path drawing itself
export function DrawPath({
  d,
  stroke = "#00FF85",
  strokeWidth = 1.5,
  fill = "none",
  duration = 1.2,
  className = "",
}: {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  duration?: number;
  className?: string;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setLength(pathRef.current.getTotalLength());
    }
  }, [d]);

  return (
    <path
      ref={pathRef}
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      className={className}
      style={{
        strokeDasharray: length,
        strokeDashoffset: length,
        animation: length ? `draw-path ${duration}s cubic-bezier(0.65, 0, 0.35, 1) forwards` : undefined,
      }}
    />
  );
}

// ── Pulse Dot ──
// Animated live indicator dot
export function PulseDot({
  color = "#00FF85",
  size = 6,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ backgroundColor: color, width: size, height: size }}
      />
    </span>
  );
}

// ── Slide Transition ──
// Slides content left/right for step wizards
export function SlideTransition({
  children,
  direction = "right",
  activeKey,
}: {
  children: ReactNode;
  direction?: "left" | "right";
  activeKey: string | number;
}) {
  const xOffset = direction === "right" ? 40 : -40;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeKey}
        initial={{ opacity: 0, x: xOffset }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -xOffset }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Progress Bar ──
// Animated fill progress bar
export function AnimatedProgress({
  value,
  max = 100,
  color = "bg-signal-green",
  height = "h-1.5",
  className = "",
}: {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  className?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={`overflow-hidden rounded-full bg-bg-base-3 ${height} ${className}`}>
      <motion.div
        className={`${height} rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
      />
    </div>
  );
}
