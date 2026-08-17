// @ts-nocheck
"use client";

import { useState, useEffect } from "react";

export default function PendingVerificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/prescriptions/pending-count");
        if (res.ok) {
          const data = await res.json();
          setCount(data.count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch pending count", err);
      }
    };

    fetchCount();
    // 15 saniyede bir kontrol et
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px] shadow-[0_0_10px_rgba(245,158,11,0.2)]">
      {count}
    </span>
  );
}
