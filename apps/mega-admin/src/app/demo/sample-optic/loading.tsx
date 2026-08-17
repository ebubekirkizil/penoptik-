// @ts-nocheck
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] w-full animate-in fade-in duration-300">
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse"></div>
        <div className="w-14 h-14 bg-surface border border-[var(--border-color)] shadow-xl rounded-2xl flex items-center justify-center relative z-10">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground animate-pulse">
        Yükleniyor...
      </p>
    </div>
  );
}
