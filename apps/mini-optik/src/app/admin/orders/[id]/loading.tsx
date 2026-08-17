import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoadingOrderDetail() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto ">
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Siparişler
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center py-32 opacity-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm font-semibold text-muted-foreground">Sipariş detayları yükleniyor...</p>
      </div>
    </div>
  );
}
