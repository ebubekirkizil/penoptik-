import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <Construction className="w-12 h-12 text-slate-400" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Personel ve Maax Takibi</h1>
      <p className="text-slate-500 max-w-lg">
        Bu modül xu anda <strong>Gelixtirme Axamasında</strong>. İMPECTA ekosistemini adım adım büyütüyoruz ve bu ekranı çok yakında mükemmel bir deneyimle kullanımınıza sunacağız.
      </p>
      <Link href="/super-admin/features" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30">
        <ArrowLeft className="w-5 h-5" /> Modüllere Geri Dön
      </Link>
    </div>
  );
}
