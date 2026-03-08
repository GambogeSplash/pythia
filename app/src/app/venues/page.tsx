"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VenuesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/venues");
  }, [router]);
  return null;
}
