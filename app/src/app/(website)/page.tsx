"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Zap,
  BarChart3,
  Shield,
  Activity,
  TrendingUp,
  Users,
  Bot,
  Bell,
  Globe,
} from "lucide-react";

/* ── Pythia Serpent Logo ── */
function SerpentLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 114 114" fill="none" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M45.9289 9.96148C55.0664 -1.96558 85.2671 -5.77327 98.2106 13.2613C116.221 24.1138 114.555 42.8088 111.368 52.5276C110.876 54.0275 109.241 54.7568 107.825 54.0598C103.402 51.883 96.7785 47.2356 93.1348 40.9245C88.6803 33.2091 87.8948 23.9202 88.0589 20.3671C86.5359 18.3365 81.9673 13.0075 70.0394 12.4999C51.7663 12.5 48.1861 26.8528 51.0048 47.5236C53.0811 62.7512 37.8075 67.3197 32.4798 66.812C29.9513 66.5711 22.8341 66.3039 22.3265 56.6583C21.9205 48.9419 27.7401 45.66 30.7007 44.9837C23.5945 48.7906 28.0625 63.7991 38.0613 56.6583C45.9289 51.0394 31.3024 29.0533 45.9289 9.96148ZM102.525 32.5497C100.563 32.5498 98.972 34.1405 98.972 36.1029C98.972 38.0652 100.563 39.6559 102.525 39.656C104.488 39.656 106.078 38.0652 106.078 36.1029C106.078 34.1405 104.487 32.5497 102.525 32.5497Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M103.795 66.2236C109.555 80.1005 97.7521 108.159 74.7959 109.851C56.3921 120.022 41.0351 109.231 34.2117 101.612C33.1587 100.436 33.3447 98.6557 34.6564 97.7777C38.753 95.0359 46.0894 91.6236 53.3769 91.6236C62.2856 91.6236 70.7224 95.5875 73.7176 97.5062C76.2373 97.2026 83.1371 95.9112 89.5409 85.8347C98.6775 70.0097 88.0377 59.7327 68.7268 51.8384C54.5012 46.0228 58.1816 30.5113 61.2851 26.151C62.7579 24.0819 66.5479 18.0517 75.1551 22.4349C82.0407 25.9416 81.9731 32.6224 81.0785 35.5245C81.3347 27.4669 66.103 23.832 67.2877 36.0617C68.2202 45.6845 94.5738 44.0108 103.795 66.2236ZM55.9344 103.943C56.9156 102.244 56.3333 100.071 54.6339 99.0896C52.9344 98.1085 50.7614 98.6907 49.7802 100.39C48.7991 102.09 49.3813 104.263 51.0807 105.244C52.7801 106.225 54.9532 105.643 55.9344 103.943Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M26.1369 88.2061C11.239 86.2563 -7.15882 62.0056 2.85378 41.2788C3.24708 20.2551 20.2707 12.3509 30.2808 10.2512C31.8257 9.92728 33.2749 10.9786 33.3794 12.5536C33.7055 17.4724 32.9925 25.532 29.3487 31.8431C24.8943 39.5583 17.2431 44.8828 14.0839 46.5174C13.0869 48.8514 10.7554 55.4725 16.28 66.0565C25.4166 81.8814 39.6367 77.8057 56.1287 65.0292C68.2781 55.6172 79.8713 66.5603 82.0955 71.4281C83.1511 73.7383 86.4782 80.0357 78.3787 85.298C71.8992 89.5077 66.1472 86.1088 64.0811 83.883C70.9311 88.1336 81.6948 76.7601 70.5113 71.6713C61.7115 67.6671 49.9842 91.3271 26.1369 88.2061ZM17.4008 27.8982C18.382 29.5975 20.5551 30.1798 22.2544 29.1987C23.9538 28.2175 24.5361 26.0444 23.555 24.345C22.5738 22.6456 20.4008 22.0633 18.7013 23.0445C17.0019 24.0257 16.4196 26.1987 17.4008 27.8982Z" fill="currentColor" />
    </svg>
  );
}

/* ── Animated Section ── */
function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Features ── */
const FEATURES = [
  { icon: <BarChart3 className="h-5 w-5" />, title: "Signal Heatmap", desc: "Real-time probability heatmap across all active markets. Spot momentum shifts before the crowd." },
  { icon: <TrendingUp className="h-5 w-5" />, title: "Cross-Venue Arb", desc: "Detect price discrepancies across Polymarket, Kalshi, and Opinion Labs. Execute simultaneously." },
  { icon: <Bot className="h-5 w-5" />, title: "Trading Bots", desc: "Deploy automated strategies — momentum riders, mean reversion, and market-making bots." },
  { icon: <Activity className="h-5 w-5" />, title: "Anomaly Detection", desc: "Whale alerts, insider signals, and volume anomalies. Know when smart money moves." },
  { icon: <Users className="h-5 w-5" />, title: "Trader Intelligence", desc: "Track top performers. Copy their strategies. Understand their edge." },
  { icon: <Bell className="h-5 w-5" />, title: "Smart Alerts", desc: "Price thresholds, volume spikes, correlation breaks. Get notified on what matters." },
];

const VENUES = [
  { name: "Polymarket", color: "#00FF85", volume: "$21.5B" },
  { name: "Kalshi", color: "#4DA6FF", volume: "$17.1B" },
  { name: "Opinion Labs", color: "#C084FC", volume: "$10B+" },
  { name: "Limitless", color: "#FFB800", volume: "$2.1B" },
  { name: "Myriad", color: "#FF6B6B", volume: "$890M" },
];

const STATS = [
  { value: "$50B+", label: "Markets Tracked" },
  { value: "1,500+", label: "Active Markets" },
  { value: "5", label: "Integrated Venues" },
  { value: "<100ms", label: "Data Latency" },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <div className="min-h-screen bg-[#060707] text-[#F0F0F0]">
      {/* ── Nav ── */}
      <nav className="fixed top-0 z-50 w-full">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <SerpentLogo size={24} className="text-[#00FF85]" />
            <span className="text-[15px] font-bold tracking-tight">PYTHIA</span>
          </div>
          <div className="hidden items-center gap-8 text-[13px] font-medium text-[#888] sm:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#venues" className="transition-colors hover:text-white">Venues</a>
            <a href="#how" className="transition-colors hover:text-white">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/GambogeSplash"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[8px] px-4 py-2 text-[13px] font-semibold text-[#888] transition-colors hover:text-white"
            >
              GitHub
            </a>
            <Link
              href="/login"
              className="rounded-[8px] bg-[#00FF85] px-4 py-2 text-[13px] font-semibold text-[#080808] transition-colors hover:bg-[#00FF85]/90"
            >
              Get Started
            </Link>
          </div>
        </div>
        {/* Nav blur backdrop */}
        <div className="absolute inset-0 -z-10 bg-[#060707]/70 backdrop-blur-xl" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }} />
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,255,133,0.06) 0%, transparent 70%)" }} />

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Large background serpent */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <SerpentLogo size={600} className="text-[#00FF85] opacity-[0.02]" />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00FF85]/20 bg-[#00FF85]/[0.06] px-4 py-1.5 text-[12px] font-medium text-[#00FF85]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF85] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00FF85]" />
              </span>
              Live — Tracking $50B+ in prediction markets
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight"
          >
            The oracle for
            <br />
            <span className="text-[#00FF85]">prediction markets.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-xl text-[clamp(1rem,2vw,1.125rem)] leading-relaxed text-[#888]"
          >
            Bloomberg Terminal for prediction markets. Aggregate signals across Polymarket, Kalshi, and more. Detect anomalies. Automate trades. See the future first.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-[10px] bg-[#00FF85] px-6 py-3 text-[14px] font-semibold text-[#080808] transition-all hover:bg-[#00FF85]/90 hover:shadow-[0_0_32px_rgba(0,255,133,0.3)]"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="rounded-[10px] border border-[#222] px-6 py-3 text-[14px] font-semibold text-[#888] transition-colors hover:border-[#444] hover:text-white"
            >
              Learn More
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-16 grid max-w-lg grid-cols-4 gap-8"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-numbers-12 text-header-20 text-[#00FF85]">{stat.value}</div>
                <div className="mt-1 text-[11px] text-[#555]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative py-32">
        <div className="mx-auto max-w-6xl px-6">
          <FadeInSection className="text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00FF85]">Features</span>
            <h2 className="mt-4 text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-tight tracking-tight">
              Everything you need to<br />
              <span className="text-[#00FF85]">dominate prediction markets.</span>
            </h2>
          </FadeInSection>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FadeInSection key={f.title} delay={i * 0.1}>
                <div className="group relative flex flex-col rounded-[16px] border border-[#151617] bg-[#0A0A0B] p-6 transition-all duration-300 hover:border-[#00FF85]/20 hover:bg-[#0D0D0E]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#00FF85]/10 text-[#00FF85] transition-colors group-hover:bg-[#00FF85]/15">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold">{f.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#666]">{f.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Venues ── */}
      <section id="venues" className="relative py-32">
        <div className="mx-auto max-w-6xl px-6">
          <FadeInSection className="text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4DA6FF]">Venue Integrations</span>
            <h2 className="mt-4 text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-tight tracking-tight">
              One terminal.<br />
              <span className="text-[#4DA6FF]">Every prediction market.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[14px] text-[#666]">
              Unified data feed across all major prediction market venues. Trade, analyze, and arbitrage from a single interface.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
              {VENUES.map((v) => (
                <div
                  key={v.name}
                  className="flex items-center gap-3 rounded-[12px] border border-[#151617] bg-[#0A0A0B] px-5 py-3 transition-all duration-300 hover:border-[#282A2D]"
                >
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: v.color }} />
                  <span className="text-[13px] font-semibold">{v.name}</span>
                  <span className="font-mono text-[11px] text-[#555]">{v.volume}</span>
                </div>
              ))}
            </div>
          </FadeInSection>

          {/* Venue architecture visual */}
          <FadeInSection delay={0.3}>
            <div className="mx-auto mt-12 flex max-w-2xl items-center justify-center gap-6">
              <div className="flex flex-col gap-2">
                {VENUES.slice(0, 3).map((v) => (
                  <div key={v.name} className="flex items-center gap-2 rounded-[8px] border border-[#151617] bg-[#0A0A0B] px-3 py-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: v.color }} />
                    <span className="text-[11px] font-medium">{v.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-px w-16 bg-[#1A1B1D]" />
                <ArrowRight className="h-4 w-4 text-[#333]" />
              </div>
              <div className="flex items-center gap-3 rounded-[12px] border border-[#00FF85]/20 bg-[#00FF85]/[0.04] px-5 py-4">
                <SerpentLogo size={24} className="text-[#00FF85]" />
                <div>
                  <div className="text-[13px] font-semibold">Pythia Engine</div>
                  <div className="text-[10px] text-[#555]">Normalized + analyzed</div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-px w-16 bg-[#1A1B1D]" />
                <ArrowRight className="h-4 w-4 text-[#333]" />
              </div>
              <div className="rounded-[12px] border border-[#151617] bg-[#0A0A0B] px-5 py-4 text-center">
                <div className="text-[13px] font-semibold">Your Edge</div>
                <div className="text-[10px] text-[#00FF85]">Alpha signals</div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="relative py-32">
        <div className="mx-auto max-w-6xl px-6">
          <FadeInSection className="text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFB800]">How It Works</span>
            <h2 className="mt-4 text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-tight tracking-tight">
              Three steps to<br />
              <span className="text-[#FFB800]">market intelligence.</span>
            </h2>
          </FadeInSection>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "Connect", desc: "Link your prediction market accounts. Polymarket, Kalshi, and more — all in one place.", icon: <Globe className="h-6 w-6" />, color: "#00FF85" },
              { step: "02", title: "Analyze", desc: "Real-time signals, anomaly detection, cross-venue arbitrage, and trader intelligence.", icon: <Zap className="h-6 w-6" />, color: "#4DA6FF" },
              { step: "03", title: "Execute", desc: "Trade manually or deploy automated bots. Set alerts. Manage risk. Capture alpha.", icon: <Shield className="h-6 w-6" />, color: "#FFB800" },
            ].map((s, i) => (
              <FadeInSection key={s.step} delay={i * 0.15}>
                <div className="relative flex flex-col items-center rounded-[16px] border border-[#151617] bg-[#0A0A0B] p-8 text-center">
                  <div className="absolute -top-4 rounded-full border border-[#151617] bg-[#0A0A0B] px-3 py-1 font-mono text-[11px] font-bold" style={{ color: s.color }}>
                    {s.step}
                  </div>
                  <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                    {s.icon}
                  </div>
                  <h3 className="mt-4 text-[17px] font-semibold">{s.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#666]">{s.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,255,133,0.04) 0%, transparent 70%)" }} />
        <FadeInSection className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <SerpentLogo size={48} className="mx-auto text-[#00FF85] opacity-50" />
          <h2 className="mt-6 text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-tight tracking-tight">
            See the future first.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14px] text-[#666]">
            Join traders using Pythia to find alpha in prediction markets.
          </p>
          <Link
            href="/login"
            className="group mt-8 inline-flex items-center gap-2 rounded-[10px] bg-[#00FF85] px-8 py-3.5 text-[14px] font-semibold text-[#080808] transition-all hover:bg-[#00FF85]/90 hover:shadow-[0_0_48px_rgba(0,255,133,0.25)]"
          >
            Launch Terminal
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </FadeInSection>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#151617] py-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <SerpentLogo size={18} className="text-[#00FF85] opacity-50" />
            <span className="text-[12px] text-[#444]">Pythia &mdash; Market Intelligence</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-[#444]">
            <a href="https://github.com/GambogeSplash" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">GitHub</a>
            <a href="https://github.com/GambogeSplash" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">Docs</a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
