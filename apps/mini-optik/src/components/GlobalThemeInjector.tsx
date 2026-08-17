// @ts-nocheck
"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeInjector, { ThemeColors } from "./ThemeInjector";

export default function GlobalThemeInjector({ themeData }: { themeData: any }) {
  const pathname = usePathname();
  const [liveThemeData, setLiveThemeData] = useState(themeData);

  // İlk yüklemede veya Next.js router cache eski prop gönderdiğinde, güncel temayı korumak için localStorage kullanıyoruz
  useEffect(() => {
    const cached = localStorage.getItem("optisyen_theme");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && Object.keys(parsed).length > 0) {
          // LocalStorage'daki tema, sunucudan gelen prop'tan farklıysa (muhtemelen daha günceldir)
          setLiveThemeData(parsed);
          return;
        }
      } catch (e) {}
    }
    
    // Cache yoksa sunucudan geleni kullan ve kaydet
    if (themeData && Object.keys(themeData).length > 0) {
      setLiveThemeData(themeData);
      localStorage.setItem("optisyen_theme", JSON.stringify(themeData));
    }
  }, [themeData]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setLiveThemeData(customEvent.detail);
        localStorage.setItem("optisyen_theme", JSON.stringify(customEvent.detail));
      }
    };
    window.addEventListener('theme-update', handleUpdate);
    return () => window.removeEventListener('theme-update', handleUpdate);
  }, []);

  let scope = "customer";
  if (pathname === "/") {
    scope = "landing";
  } else if (pathname?.startsWith("/admin")) {
    scope = "admin";
  } else if (pathname?.startsWith("/login") || pathname?.startsWith("/change-password") || pathname?.startsWith("/register")) {
    scope = "login";
  }

  const currentTheme: ThemeColors = liveThemeData?.[scope] || liveThemeData;

  return <ThemeInjector theme={currentTheme} />;
}
