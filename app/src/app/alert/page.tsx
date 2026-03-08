"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AlertRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/alert");
  }, [router]);
  return null;
}
