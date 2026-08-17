import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Yetkisiz Erişim</h1>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Bu sayfaya veya modüle erişim yetkiniz bulunmamaktadır. Lütfen sistem yöneticinizle iletişime geçiniz.
        </p>
      </div>
      <Link href="/admin" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Ana Sayfaya Dön
      </Link>
    </div>
  );
}
