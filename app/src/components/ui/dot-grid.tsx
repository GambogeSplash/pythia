"use client";

export function DotGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "80%",
          height: "55%",
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 30%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 30%, black 20%, transparent 70%)",
        }}
      />
    </div>
  );
}
