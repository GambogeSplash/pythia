"use client";

import { useRef, useState } from "react";
import { DotGrid } from "@/components/ui/dot-grid";
import { PythiaLogo } from "@/components/ui/pythia-logo";
import { PythiaBrandMark } from "@/components/ui/empty-state";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CODE_LENGTH = 5;

export default function VerifyPage() {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg-primary">
      {/* Background brand mark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <PythiaBrandMark size={500} className="text-signal-green opacity-[0.03]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,255,133,0.04) 0%, transparent 60%)" }}
      />
      <DotGrid />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <PythiaLogo />

        <div className="mt-16 w-full">
          <Link
            href="/login"
            className="flex items-center gap-1 text-text-tertiary transition-colors hover:text-text-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <p className="mt-4 text-sm text-text-secondary">
            Enter the code we sent to
          </p>
          <p className="text-sm font-medium text-text-primary">
            daw@proton.com
          </p>

          {/* OTP inputs */}
          <div className="mt-6 flex gap-3">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`h-12 w-12 rounded-md border text-center font-data text-lg font-medium text-text-primary outline-none transition-colors ${
                  digit
                    ? "border-signal-green bg-bg-surface"
                    : "border-border-secondary bg-bg-surface"
                } focus:border-signal-green`}
              />
            ))}
          </div>

          <button className="mt-10 text-sm text-signal-green hover:underline">
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}
