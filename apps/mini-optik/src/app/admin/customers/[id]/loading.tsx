import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoadingCustomerDetail() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto ">
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/customers" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Müşteriler
        </Link>
      </div>

      {/* Customer Info Card Skeleton */}
      <div className="bg-white dark:bg-surface shadow-sm rounded-2xl p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/20 animate-pulse flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-3">
            <div className="h-7 bg-muted/20 rounded w-1/3 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="h-4 bg-muted/20 rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-muted/20 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-muted/20 rounded w-3/4 animate-pulse sm:col-span-2 mt-1" />
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="h-8 w-20 bg-muted/20 rounded-xl animate-pulse" />
            <div className="h-8 w-20 bg-muted/20 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 border-b border-border-color mb-6 pb-2">
        <div className="h-8 w-24 bg-muted/20 rounded-lg animate-pulse" />
        <div className="h-8 w-24 bg-muted/20 rounded-lg animate-pulse" />
        <div className="h-8 w-24 bg-muted/20 rounded-lg animate-pulse" />
      </div>

      {/* Main Content Loading Spinner */}
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm font-semibold text-muted-foreground">Müşteri detayları yükleniyor...</p>
      </div>
    </div>
  );
}
