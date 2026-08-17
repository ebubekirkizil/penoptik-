import { db } from "@/lib/db";
import { Search, Edit2, Trash2, ShieldCheck, Mail } from "lucide-react";
import Image from "next/image";
import AddCustomerModal from "./AddCustomerModal";

export const revalidate = 0;

export default async function NfcUsersManagementPage() {
  let profiles: any[] = [];
  
  try {
    profiles = await db.nfcProfile.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        _count: {
          select: { modules: true, analytics: true }
        }
      }
    });
  } catch (error) {
    console.error("NFC Profile query error:", error);
  }

  let availableCards: any[] = [];
  try {
    availableCards = await db.nfcCard.findMany({
      where: { userId: null, isLocked: false },
      select: { id: true, serialCode: true },
      orderBy: { serialCode: 'asc' },
    });
  } catch (error) {
    console.error("Available cards query error:", error);
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Müxteri Yönetimi</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">NFC profiline sahip müxterileri, VIP durumlarını ve hesaplarını yönetin.</p>
        </div>
        <AddCustomerModal availableCards={availableCards} />
      </div>

      {/* Arama ve Filtreleme */}
      <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-gray-200 dark:border-[#1E293B] shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="İsim, e-posta veya URL slug ara..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-[#1E293B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#0F172A] transition-all"
          />
        </div>
        <select className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-[#1E293B] rounded-lg px-4 py-2 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Tüm Müxteriler</option>
          <option>VIP (Ömür Boyu)</option>
          <option>Aylık Ödeyenler</option>
          <option>Yıllık Ödeyenler</option>
        </select>
      </div>

      {/* Grid Profil Listesi (Mobil ve Masaüstü için Kart Yapısı) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-white dark:bg-[#0F172A] rounded-2xl border border-gray-200 dark:border-[#1E293B] shadow-sm hover:shadow-md transition-all overflow-hidden relative flex flex-col">
            
            {/* Üst Kısım / Kapak Rengi */}
            <div 
              className="h-20 w-full relative"
              style={{ backgroundColor: profile.themeColor || '#1e3a8a' }}
            >
              {profile.isPublished && (
                <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> AKTİF
                </div>
              )}
            </div>
            
            {/* Profil Resmi */}
            <div className="px-5 relative">
              <div className="w-16 h-16 rounded-full border-4 border-white dark:border-[#0F172A] bg-gray-100 dark:bg-slate-800 shadow-sm -mt-8 flex items-center justify-center text-xl font-bold text-gray-400 dark:text-slate-500 relative overflow-hidden">
                {profile.profileImage ? (
                  <Image src={profile.profileImage} alt={profile.name} fill className="object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Bilgiler */}
            <div className="px-5 pt-3 pb-5 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{profile.name}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-3 line-clamp-1">{profile.title || "Ünvan Yok"}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                  <Mail size={14} className="text-gray-400 dark:text-slate-500" />
                  <span className="truncate">{profile.user?.email || "Email Yok"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800/50 rounded-md font-mono">/p/{profile.slug}</span>
                </div>
              </div>
              
              <div className="flex gap-4 text-xs font-medium text-gray-500 dark:text-slate-400 border-t border-gray-100 dark:border-[#1E293B] pt-3">
                <div>
                  <span className="text-gray-900 dark:text-white font-bold block">{profile._count.modules}</span>
                  Modül
                </div>
                <div>
                  <span className="text-gray-900 dark:text-white font-bold block">{profile._count.analytics}</span>
                  Tıklama
                </div>
                <div className="ml-auto text-right">
                  <span className={`block font-bold ${profile.isPublished ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                    {profile.isPublished ? 'Yayında' : 'Taslak'}
                  </span>
                  Durum
                </div>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex border-t border-gray-100 dark:border-[#1E293B] bg-gray-50 dark:bg-slate-800/30">
              <button className="flex-1 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center justify-center gap-2 transition-colors">
                <Edit2 size={16} /> Düzenle
              </button>
              <div className="w-px bg-gray-200 dark:bg-[#1E293B]"></div>
              <button className="flex-1 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center gap-2 transition-colors">
                <Trash2 size={16} /> Sil
              </button>
            </div>
            
          </div>
        ))}

        {profiles.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 dark:text-slate-400 bg-white dark:bg-[#0F172A] rounded-2xl border border-gray-200 dark:border-[#1E293B]">
            Sistemde henüz müxteri profili bulunmuyor.
          </div>
        )}
      </div>

    </div>
  );
}
