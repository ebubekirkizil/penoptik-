"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const hasConsented = localStorage.getItem("cookie_consent");
    if (!hasConsented) {
      // Show the popup after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:max-w-[400px] z-[9999] animate-fade-in-up">
      <div className="bg-surface/90 backdrop-blur-xl border border-border-color shadow-2xl rounded-2xl p-5 md:p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-bold text-sm">Çerez Politikası</h3>
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                Size daha iyi bir deneyim sunabilmek için sitemizde çerezler kullanılmaktadır.
              </p>
            </div>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          <button 
            onClick={handleReject}
            className="flex-1 py-2.5 px-4 bg-background border border-border-color text-foreground text-xs font-bold rounded-xl hover:bg-muted transition-colors"
          >
            Reddet
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
