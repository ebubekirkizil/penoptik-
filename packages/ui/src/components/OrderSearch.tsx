// @ts-nocheck
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export function OrderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [val, setVal] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) {
        params.set("q", val);
      } else {
        params.delete("q");
      }
      
      const qs = params.toString();
      router.push(`/demo/sample-optic/orders${qs ? `?${qs}` : ""}`);
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [val, router, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full max-w-lg">
      <div className="relative w-full sm:flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Müşteri adı, ürün, kod..."
          className="block w-full pl-10 pr-3 py-2 border border-border-color rounded-xl leading-5 bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
        />
      </div>
    </div>
  );
}
