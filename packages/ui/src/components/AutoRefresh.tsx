// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AutoRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const [initialVersion, setInitialVersion] = useState<number | null>(null);
  
  // Track last refresh time to avoid spamming
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch("/api/system/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.version && data.version > 0) {
          if (initialVersion === null) {
            setInitialVersion(data.version);
          } else if (data.version > initialVersion) {
            // A change was detected in the database
            const now = Date.now();
            if (now - lastRefresh > 2000) { // debounce refresh
              router.refresh();
              setLastRefresh(now);
              
              // explicitly fetch new theme settings
              fetch("/api/settings", { cache: "no-store" })
                .then(res => res.json())
                .then(settingsData => {
                  if (settingsData.themeData) {
                    window.dispatchEvent(new CustomEvent('theme-update', { detail: settingsData.themeData }));
                  }
                })
                .catch(e => console.error("Auto refresh theme fetch failed:", e));
            }
            
            setInitialVersion(data.version);
          }
        }
      } catch (error) {
        // silently ignore fetch errors (e.g. network disconnects)
      }
    };

    // Check version immediately on mount
    checkVersion();
    
    // Poll every 3 seconds for near-instant cross-device sync
    const intervalId = setInterval(checkVersion, 3000);
    
    // Instant sync across tabs in the same browser
    const bc = new BroadcastChannel("penoptik_sync");
    bc.onmessage = (event) => {
      if (event.data === "refresh") {
        router.refresh();
      }
    };
    
    // Check when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
        router.refresh();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    
    // Check when navigating back/forward via BFCache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Force a server reload so middleware can verify the HttpOnly saas_session cookie
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      clearInterval(intervalId);
      bc.close();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pathname, initialVersion, router, lastRefresh]);

  return null; // This is a logic-only component
}
