"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ArrowRight, Mail, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
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

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expirySeconds, setExpirySeconds] = useState(600); // 10 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // OTP expiry countdown
  useEffect(() => {
    if (step !== "otp" || expirySeconds <= 0) return;
    const t = setInterval(() => setExpirySeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step, expirySeconds]);

  const sendOtp = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send code");
      }
      setStep("otp");
      setOtp(Array(OTP_LENGTH).fill(""));
      setResendCooldown(RESEND_COOLDOWN);
      setExpirySeconds(600);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await sendOtp();
  };

  const verifyAndSignIn = useCallback(async (code: string) => {
    setLoading(true);
    setError("");
    try {
      // Verify OTP
      const verifyRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.valid) {
        setError(verifyData.error || "Invalid code");
        setLoading(false);
        return;
      }

      // Sign in via NextAuth
      const result = await signIn("credentials", {
        email: email.trim(),
        password: "",
        redirect: false,
      });

      if (result?.error) {
        setError("Sign in failed. Please try again.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setTransitioning(true);
      setTimeout(() => router.push("/dashboard"), 800);
    } catch {
      setError("Verification failed. Please try again.");
      setLoading(false);
    }
  }, [email, router]);

  const handleOtpChange = (index: number, value: string) => {
    // Handle paste of full code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      // Auto-submit if all filled
      if (newOtp.every((d) => d !== "")) {
        verifyAndSignIn(newOtp.join(""));
      }
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && newOtp.every((d) => d !== "")) {
      verifyAndSignIn(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const digits = pasted.split("");
    const newOtp = Array(OTP_LENGTH).fill("");
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    const focusIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
    if (newOtp.every((d) => d !== "")) {
      verifyAndSignIn(newOtp.join(""));
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) return;
    verifyAndSignIn(code);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await sendOtp();
  };

  const handleBack = () => {
    setStep("email");
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
  };

  const handleWalletConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTransitioning(true);
      setTimeout(() => router.push("/dashboard"), 800);
    }, 1500);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
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
                <span className="text-body-14 font-medium text-[#666]">Initializing terminal...</span>
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
            <p className="mt-3 max-w-sm text-body-14 leading-relaxed text-[#555]">
              Aggregate signals. Detect anomalies. Execute trades. All from one terminal.
            </p>
            <div className="mt-6 flex items-center gap-6">
              {[
                { value: "1,500+", label: "Markets" },
                { value: "5", label: "Venues" },
                { value: "<100ms", label: "Latency" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-mono text-header-14 font-bold text-[#00FF85]">{s.value}</div>
                  <div className="text-caption-10 text-[#444]">{s.label}</div>
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
              <span className="text-header-16 font-bold tracking-tight text-white">PYTHIA</span>
            </motion.div>

            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h1 className="mt-8 text-display-24 font-bold text-white">Welcome back</h1>
                    <p className="mt-1 text-body-14 text-[#666]">Sign in to access your trading terminal.</p>
                  </motion.div>

                  <motion.form
                    onSubmit={handleEmailSubmit}
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
                        className="h-11 w-full rounded-[10px] border border-[#1A1B1D] bg-[#0D0D0E] pl-10 pr-4 text-body-14 text-white placeholder-[#444] outline-none transition-colors focus:border-[#00FF85]/50 focus:bg-[#0A0A0B]"
                      />
                    </div>
                    {error && (
                      <p className="text-body-12 text-red-400">{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="group flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#00FF85] text-body-14 font-semibold text-[#080808] transition-all hover:bg-[#00FF85]/90 hover:shadow-[0_0_24px_rgba(0,255,133,0.2)] disabled:opacity-60"
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
                      <span className="text-body-12 font-medium text-[#444]">OR</span>
                      <div className="h-px flex-1 bg-[#1A1A1A]" />
                    </div>

                    <button
                      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                      disabled={loading}
                      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#1A1B1D] bg-[#0D0D0E] text-body-14 font-semibold text-white transition-all hover:border-[#282A2D] hover:bg-[#121314] disabled:opacity-60"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>

                    <button
                      onClick={handleWalletConnect}
                      disabled={loading}
                      className="mt-2 flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#1A1B1D] bg-[#0D0D0E] text-body-14 font-semibold text-white transition-all hover:border-[#282A2D] hover:bg-[#121314] disabled:opacity-60"
                    >
                      <Wallet className="h-4 w-4 text-[#888]" />
                      Connect Wallet
                    </button>

                    <p className="mt-6 text-center text-body-12 text-[#444]">
                      Don&apos;t have an account?{" "}
                      <Link href="/login" className="text-[#00FF85] transition-colors hover:text-[#00FF85]/80">
                        Sign up
                      </Link>
                    </p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mt-8">
                    <button
                      onClick={handleBack}
                      className="mb-4 flex items-center gap-1.5 text-body-12 text-[#666] transition-colors hover:text-[#999]"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </button>

                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-[#00FF85]" />
                      <h1 className="text-display-24 font-bold text-white">Verify your email</h1>
                    </div>
                    <p className="mt-1.5 text-body-14 text-[#666]">
                      We sent a 6-digit code to{" "}
                      <span className="text-[#999]">{email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="mt-8">
                    <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { inputRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={OTP_LENGTH}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          autoFocus={i === 0}
                          className="h-[52px] w-[46px] rounded-[10px] border border-[#1A1B1D] bg-[#0D0D0E] text-center font-mono text-header-20 font-bold text-white outline-none transition-all focus:border-[#00FF85]/50 focus:bg-[#0A0A0B] focus:shadow-[0_0_0_1px_rgba(0,255,133,0.15)]"
                        />
                      ))}
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-body-12 text-red-400"
                      >
                        {error}
                      </motion.p>
                    )}

                    <button
                      type="submit"
                      disabled={loading || otp.some((d) => !d)}
                      className="group mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#00FF85] text-body-14 font-semibold text-[#080808] transition-all hover:bg-[#00FF85]/90 hover:shadow-[0_0_24px_rgba(0,255,133,0.2)] disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Verify & Sign In
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Resend + Timer */}
                  <div className="mt-5 flex items-center justify-between">
                    <button
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || loading}
                      className="text-body-12 text-[#666] transition-colors hover:text-[#00FF85] disabled:cursor-not-allowed disabled:text-[#333]"
                    >
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Resend code"}
                    </button>
                    {expirySeconds > 0 ? (
                      <span className="font-mono text-body-12 text-[#444]">
                        Expires in {formatTime(expirySeconds)}
                      </span>
                    ) : (
                      <span className="text-body-12 text-red-400/80">Code expired</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  className="rounded-[6px] border border-[#151617] bg-[#0A0A0B] px-2.5 py-1 text-label-9 font-medium text-[#444]"
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
