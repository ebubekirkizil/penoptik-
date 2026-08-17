"use client";

import { useRouter } from "next/navigation";
import React, { useTransition, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

function LoadingOverlay() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  if (!mounted) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-surface border border-[var(--border-color)] shadow-2xl rounded-2xl p-6 flex flex-col items-center animate-in zoom-in-95 duration-200">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-bold text-foreground">Sayfa Yükleniyor...</p>
      </div>
    </div>,
    document.body
  );
}

export default function ClickableCard({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const handleClick = (e: React.MouseEvent) => {
    if (isPending) return;
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`cursor-pointer transition-all duration-300 ${className || ""} ${
          isPending ? "opacity-50 pointer-events-none scale-[0.98]" : "active:scale-[0.99]"
        }`}
        style={isPending ? { cursor: "wait" } : {}}
      >
        {children}
      </div>
      {isPending && <LoadingOverlay />}
    </>
  );
}
