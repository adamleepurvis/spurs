"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const MIN_GAP_MS = 30_000;

// Installed home-screen apps have no pull-to-refresh and keep their page
// alive in the background, so re-fetch when the app comes back to the front.
export default function RefreshOnFocus() {
  const router = useRouter();

  useEffect(() => {
    let last = Date.now();
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - last < MIN_GAP_MS) return;
      last = Date.now();
      router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [router]);

  return null;
}
