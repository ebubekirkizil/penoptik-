"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function AnalyticsTracker({ profileId }: { profileId: string }) {
  const tracked = useRef(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const cardId = searchParams.get("ref");

    fetch("/api/nfc/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profileId,
        cardId,
        actionType: "page_view",
      }),
    }).catch(err => console.error("Analytics tracking failed:", err));

  }, [profileId, searchParams]);

  return null;
}
