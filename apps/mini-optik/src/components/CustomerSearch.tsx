// @ts-nocheck
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export function CustomerSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [val, setVal] = useState(searchParams.get("q") || "");
  const [filter, setFilter] = useState(searchParams.get("filter") || "all");

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (val) params.set("q", val);
      if (filter !== "all") params.set("filter", filter);
      
      const qs = params.toString();
      router.push(`/admin/customers${qs ? `?${qs}` : ""}`);
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [val, filter, router]);

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
          placeholder="İsim, soyisim veya telefon..."
          className="block w-full pl-10 pr-3 py-2 border border-border-color rounded-xl leading-5 bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
        />
      </div>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full sm:w-auto bg-surface border border-border-color rounded-xl px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        <option value="all">Tüm Müşteriler</option>
        <option value="active">Aktif (Giriş Yapanlar)</option>
        <option value="inactive">Pasif (Hiç Girmeyenler)</option>
      </select>
    </div>
  );
}
