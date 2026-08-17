// @ts-nocheck
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="w-10 h-10 rounded-xl border border-border-color bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all touch-manipulation relative z-50 flex-shrink-0"
        title="Tema Değiştir"
        aria-label="Tema Değiştir"
      >
        <span className="w-5 h-5 block" />
      </button>
    );
  }

  return (
    <AnimatedThemeToggler
      theme={resolvedTheme as "light" | "dark"}
      onThemeChange={(newTheme) => setTheme(newTheme)}
      className="w-10 h-10 rounded-xl border border-border-color bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all touch-manipulation relative z-50 flex-shrink-0"
    />
  );
}
