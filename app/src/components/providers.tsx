"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { useAppStore } from "@/lib/store";

function StoreHydrator({ children }: { children: React.ReactNode }) {
  const hydrateFromStorage = useAppStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <StoreHydrator>{children}</StoreHydrator>
      </ThemeProvider>
    </SessionProvider>
  );
}
