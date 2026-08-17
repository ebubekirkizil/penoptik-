import { db } from "@/lib/db";
import { Plus, Search, ShieldOff, ShieldCheck, Link as LinkIcon, AlertTriangle, Palette } from "lucide-react";
import Link from "next/link";
import GenerateCardsButton from "./GenerateCardsButton";
import AssignCardButton from "./AssignCardButton";
import LockCardButton from "./LockCardButton";

export const revalidate = 0;

export default async function NfcCardsManagementPage() {
  // En son oluxturulan 50 kartı listele
  let cards: any[] = [];
  try {
    cards = await db.nfcCard.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: { nfcProfile: true }
        }
      }
    });
  } catch (error) {
    console.error("NFC Card query error:", error);
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Kart Yönetimi</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Sistemdeki tüm NFC kartlarını (Stok & B2C) listeleyin ve yönetin.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-4 py-2 rounded-lg font-medium transition-colors border border-blue-200 dark:border-blue-500/30">
            Dıxa Aktar
          </button>
          <GenerateCardsButton />
        </div>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-gray-200 dark:border-[#1E293B] shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Seri no veya müxteri ara..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-[#1E293B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#0F172A] transition-all"
          />
        </div>
        <select className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-[#1E293B] rounded-lg px-4 py-2 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Tüm Tipler</option>
          <option>Stok (Kurumsal)</option>
          <option>B2C (Bireysel)</option>
        </select>
        <select className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-[#1E293B] rounded-lg px-4 py-2 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Tüm Durumlar</option>
          <option>Aktif Kartlar</option>
          <option>İptal Edilenler</option>
          <option>Box Kartlar</option>
        </select>
      </div>

      {/* Mobil Uyumlu Kart Listesi (Tablo / Card Hybrid) */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-[#1E293B] shadow-sm overflow-hidden">
        
        {/* Masaüstü Tablo Baxlıkları */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-[#1E293B] font-bold text-gray-500 dark:text-slate-400 text-sm">
          <div className="col-span-2">Kart (Seri No)</div>
          <div className="col-span-4">NFC'ye Yazılacak Link</div>
          <div className="col-span-2">Üretim Tarihi</div>
          <div className="col-span-2">Atanan Müxteri</div>
          <div className="col-span-2 text-right">Durum & İxlem</div>
        </div>

        {/* Liste Elemanları */}
        <div className="divide-y divide-gray-100 dark:divide-[#1E293B]">
          {cards.map((card) => (
            <div key={card.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:items-center hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
              
              {/* Kart (Seri No) */}
              <div className="md:col-span-2 flex items-center justify-between md:block">
                <span className="md:hidden text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Kart</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">Kart {card.serialCode}</span>
              </div>

              {/* NFC'ye Yazılacak Link */}
              <div className="md:col-span-4 flex flex-col mt-2 md:mt-0">
                <span className="md:hidden text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Link</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs sm:text-sm bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded text-blue-600 dark:text-blue-400 break-all select-all font-mono">
                    https://sentientwire.com/nfc/{card.serialCode}{card.activationCode ? `?pass=${card.activationCode}` : ""}
                  </code>
                </div>
              </div>

              {/* Üretim Tarihi */}
              <div className="md:col-span-2 flex items-center justify-between md:flex-col md:items-start mt-2 md:mt-0">
                <span className="md:hidden text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Üretim Tarihi</span>
                <div className="text-sm font-medium text-gray-600 dark:text-slate-300">
                  {new Date(card.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Müxteri */}
              <div className="md:col-span-2 flex items-center justify-between md:flex-col md:items-start mt-2 md:mt-0">
                <span className="md:hidden text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Müxteri</span>
                {card.user?.nfcProfile ? (
                  <div className="flex flex-col md:text-left text-right min-w-0 flex-1 ml-4 md:ml-0">
                    <span className="font-bold text-gray-900 dark:text-white truncate">{card.user.nfcProfile.name}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate">{card.user.email}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-slate-500 italic font-medium">Atanmamıx (Boxta)</span>
                )}
              </div>

              {/* Durum & İxlem */}
              <div className="md:col-span-2 flex flex-col md:items-end mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 md:mt-0 md:pt-0 md:border-0 gap-3">
                <div className="flex w-full items-center justify-between md:justify-end gap-2">
                  <span className="md:hidden text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Durum</span>
                  {card.user ? (
                     <span className="inline-flex px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 rounded-full text-[10px] sm:text-xs font-bold">
                       KULLANIMDA
                     </span>
                  ) : (
                     <span className="inline-flex px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300 rounded-full text-[10px] sm:text-xs font-bold">
                       BOŞTA
                     </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:flex w-full md:w-auto gap-2">
                  {!card.user && (
                    <div className="col-span-2">
                      <AssignCardButton serialCode={card.serialCode} />
                    </div>
                  )}
                  <LockCardButton cardId={card.id} isLocked={card.isLocked} />
                  <Link 
                    href={`/super-admin/nfc/cards/${card.serialCode}`}
                    className="text-[11px] sm:text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-2 md:py-1.5 rounded-lg border border-blue-200 transition-colors inline-flex items-center justify-center gap-1 w-full md:w-auto"
                  >
                    <Palette className="w-3 h-3" /> Profili Tasarla
                  </Link>
                </div>
              </div>

            </div>
          ))}
          
          {cards.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-slate-400">
              Henüz sistemde hiç kart bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
