// @ts-nocheck
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => {
        if (mounted) {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
        }
      }}
      className={className || "w-10 h-10 rounded-xl border border-border-color bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all touch-manipulation relative z-50 flex-shrink-0"}
      title="Tema Değiştir"
      aria-label="Tema Değiştir"
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>
        {mounted ? (
          resolvedTheme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )
        ) : (
          <span className="w-5 h-5 block" />
        )}
      </span>
    </button>
  );
}
