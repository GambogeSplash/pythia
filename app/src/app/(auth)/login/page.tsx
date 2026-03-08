"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ArrowRight, Mail, Loader2 } from "lucide-react";
import Link from "next/link";

function SerpentLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 114 114" fill="none" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M45.9289 9.96148C55.0664 -1.96558 85.2671 -5.77327 98.2106 13.2613C116.221 24.1138 114.555 42.8088 111.368 52.5276C110.876 54.0275 109.241 54.7568 107.825 54.0598C103.402 51.883 96.7785 47.2356 93.1348 40.9245C88.6803 33.2091 87.8948 23.9202 88.0589 20.3671C86.5359 18.3365 81.9673 13.0075 70.0394 12.4999C51.7663 12.5 48.1861 26.8528 51.0048 47.5236C53.0811 62.7512 37.8075 67.3197 32.4798 66.812C29.9513 66.5711 22.8341 66.3039 22.3265 56.6583C21.9205 48.9419 27.7401 45.66 30.7007 44.9837C23.5945 48.7906 28.0625 63.7991 38.0613 56.6583C45.9289 51.0394 31.3024 29.0533 45.9289 9.96148ZM102.525 32.5497C100.563 32.5498 98.972 34.1405 98.972 36.1029C98.972 38.0652 100.563 39.6559 102.525 39.656C104.488 39.656 106.078 38.0652 106.078 36.1029C106.078 34.1405 104.487 32.5497 102.525 32.5497Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M103.795 66.2236C109.555 80.1005 97.7521 108.159 74.7959 109.851C56.3921 120.022 41.0351 109.231 34.2117 101.612C33.1587 100.436 33.3447 98.6557 34.6564 97.7777C38.753 95.0359 46.0894 91.6236 53.3769 91.6236C62.2856 91.6236 70.7224 95.5875 73.7176 97.5062C76.2373 97.2026 83.1371 95.9112 89.5409 85.8347C98.6775 70.0097 88.0377 59.7327 68.7268 51.8384C54.5012 46.0228 58.1816 30.5113 61.2851 26.151C62.7579 24.0819 66.5479 18.0517 75.1551 22.4349C82.0407 25.9416 81.9731 32.6224 81.0785 35.5245C81.3347 27.4669 66.103 23.832 67.2877 36.0617C68.2202 45.6845 94.5738 44.0108 103.795 66.2236ZM55.9344 103.943C56.9156 102.244 56.3333 100.071 54.6339 99.0896C52.9344 98.1085 50.7614 98.6907 49.7802 100.39C48.7991 102.09 49.3813 104.263 51.0807 105.244C52.7801 106.225 54.9532 105.643 55.9344 103.943Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M26.1369 88.2061C11.239 86.2563 -7.15882 62.0056 2.85378 41.2788C3.24708 20.2551 20.2707 12.3509 30.2808 10.2512C31.8257 9.92728 33.2749 10.9786 33.3794 12.5536C33.7055 17.4724 32.9925 25.532 29.3487 31.8431C24.8943 39.5583 17.2431 44.8828 14.0839 46.5174C13.0869 48.8514 10.7554 55.4725 16.28 66.0565C25.4166 81.8814 39.6367 77.8057 56.1287 65.0292C68.2781 55.6172 79.8713 66.5603 82.0955 71.4281C83.1511 73.7383 86.4782 80.0357 78.3787 85.298C71.8992 89.5077 66.1472 86.1088 64.0811 83.883C70.9311 88.1336 81.6948 76.7601 70.5113 71.6713C61.7115 67.6671 49.9842 91.3271 26.1369 88.2061ZM17.4008 27.8982C18.382 29.5975 20.5551 30.1798 22.2544 29.1987C23.9538 28.2175 24.5361 26.0444 23.555 24.345C22.5738 22.6456 20.4008 22.0633 18.7013 23.0445C17.0019 24.0257 16.4196 26.1987 17.4008 27.8982Z" fill="currentColor" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.trim(),
      password: "", // MVP: no password required
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Sign in failed. Please try again.");
      return;
    }

    setLoading(false);
    setTransitioning(true);
    setTimeout(() => router.push("/dashboard"), 800);
  };

  const handleWalletConnect = () => {
    // Wallet connect — placeholder for future Web3 auth
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTransitioning(true);
      setTimeout(() => router.push("/dashboard"), 800);
    }, 1500);
  };

  return (
    <>
      {/* Fullscreen transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#060707]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <SerpentLogo size={48} className="text-[#00FF85]" />
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 animate-pulse rounded-full bg-[#00FF85]" />
                <span className="text-[13px] font-medium text-[#666]">Initializing terminal...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex min-h-screen bg-[#060707]">
        {/* Left — Brand side */}
        <div className="relative hidden flex-1 items-center justify-center overflow-hidden lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,255,133,0.06) 0%, transparent 70%)" }} />
          <SerpentLogo size={320} className="text-[#00FF85] opacity-[0.04]" />

          <div className="absolute bottom-12 left-12 right-12">
            <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold leading-tight tracking-tight text-white">
              The oracle for<br />
              <span className="text-[#00FF85]">prediction markets.</span>
            </h2>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-[#555]">
              Aggregate signals. Detect anomalies. Execute trades. All from one terminal.
            </p>
            <div className="mt-6 flex items-center gap-6">
              {[
                { value: "1,500+", label: "Markets" },
                { value: "5", label: "Venues" },
                { value: "<100ms", label: "Latency" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-mono text-[15px] font-bold text-[#00FF85]">{s.value}</div>
                  <div className="text-[10px] text-[#444]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="absolute top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-[#1A1A1A] to-transparent lg:block" style={{ right: 480 }} />

        {/* Right — Login form */}
        <div className="flex w-full flex-col items-center justify-center px-6 lg:w-[480px] lg:shrink-0">
          <div className="w-full max-w-[340px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2.5"
            >
              <SerpentLogo size={28} className="text-[#00FF85]" />
              <span className="text-[17px] font-bold tracking-tight text-white">PYTHIA</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="mt-8 text-[22px] font-bold text-white">Welcome back</h1>
              <p className="mt-1 text-[13px] text-[#666]">Sign in to access your trading terminal.</p>
            </motion.div>

            <motion.form
              onSubmit={handleLogin}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 space-y-3"
            >
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="h-11 w-full rounded-[10px] border border-[#1A1B1D] bg-[#0D0D0E] pl-10 pr-4 text-[13px] text-white placeholder-[#444] outline-none transition-colors focus:border-[#00FF85]/50 focus:bg-[#0A0A0B]"
                />
              </div>
              {error && (
                <p className="text-[11px] text-red-400">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#00FF85] text-[13px] font-semibold text-[#080808] transition-all hover:bg-[#00FF85]/90 hover:shadow-[0_0_24px_rgba(0,255,133,0.2)] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#1A1A1A]" />
                <span className="text-[11px] font-medium text-[#444]">OR</span>
                <div className="h-px flex-1 bg-[#1A1A1A]" />
              </div>

              <button
                onClick={handleWalletConnect}
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#1A1B1D] bg-[#0D0D0E] text-[13px] font-semibold text-white transition-all hover:border-[#282A2D] hover:bg-[#121314] disabled:opacity-60"
              >
                <Wallet className="h-4 w-4 text-[#888]" />
                Connect Wallet
              </button>

              <p className="mt-6 text-center text-[11px] text-[#444]">
                Don&apos;t have an account?{" "}
                <Link href="/login" className="text-[#00FF85] transition-colors hover:text-[#00FF85]/80">
                  Sign up
                </Link>
              </p>
            </motion.div>

            {/* Venue tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex items-center justify-center gap-3"
            >
              {["Polymarket", "Kalshi", "Opinion Labs"].map((name) => (
                <div
                  key={name}
                  className="rounded-[6px] border border-[#151617] bg-[#0A0A0B] px-2.5 py-1 text-[9px] font-medium text-[#444]"
                >
                  {name}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
