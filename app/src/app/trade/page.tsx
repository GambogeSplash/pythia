"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TradeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/trade");
  }, [router]);
  return null;
}
