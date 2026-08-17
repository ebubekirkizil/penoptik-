import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function UnassignedCardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-900">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500" />
        
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
        </div>
        
        <h1 className="text-2xl font-black mb-4">Kart Aktif Değil</h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Bu akıllı kart henüz aktiflextirilmemixtir. Lütfen sistem yöneticinizle (Mega Admin) iletixime geçin.
        </p>
        
        <Link 
          href="/"
          className="inline-block w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
