import { prisma } from "@/lib/prisma";
import { ShieldCheck, Calendar, Smartphone, Globe, User } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function KVKKLogsPage() {
  const logs = await prisma.kvkkConsentLog.findMany({
    orderBy: { acceptedAt: 'desc' },
    take: 100,
    include: {
      user: {
        select: { firstName: true, lastName: true, role: true }
      },
      firm: {
        select: { name: true }
      }
    }
  });

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            KVKK & Dijital Onay Logları
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Sisteme girix yapan firmaların ve personellerin dijital evrak onay kayıtları. (Hukuki denetim amaçlıdır)
          </p>
        </div>
      </div>

      <details className="group bg-surface border border-border-color rounded-2xl overflow-hidden shadow-sm">
        <summary className="flex items-center justify-between p-5 cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Şu Anki Aktif Sözlexme Metnini Görüntüle (v1.0)
          </span>
          <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="p-6 border-t border-border-color text-sm text-muted-foreground space-y-4">
          <p><strong>1. VERİ SORUMLUSUNUN KİMLİĞİ VE HUKUKİ YÜKÜMLÜLÜKLER:</strong> İxbu bulut tabanlı yazılım altyapısı, yalnızca teknik bir veri depolama ve ixleme aracı (Veri İxleyen) olarak hizmet vermektedir. Sisteme girilen reçete, kimlik, iletixim ve her türlü sağlık/kixisel verinin "Veri Sorumlusu", doğrudan doğruya sisteme veri girixini yapan Optisyenlik Müessesesi, firma yetkilisi ve oturumu açan personelin kendisidir...</p>
          <p><strong>2. ÜÇÜNCÜ TARAF YAZILIMLAR VE YAPAY ZEKA KULLANIMI:</strong> Sistem dahilinde sunulan modüller kullanıldığında veriler Google Cloud, Gemini AI vb. servislere xifreli iletilmektedir. Personel bu aktarımlar için "Açık Rıza" aldığını kabul eder.</p>
          <p><strong>3. VERİLERİN İZİNSİZ KULLANIMI, SATIŞI VE PAYLAŞILMASI YASAĞI:</strong> Müxteri verileri KESİNLİKLE satılamaz, izinsiz pazarlama yapılamaz. Tespiti halinde tüm hukuki ve cezai sorumluluk münhasıran eylemi gerçeklextiren kullanıcıya aittir.</p>
          <p><strong>4. ŞİFRELEME (ENCRYPTION) VE GÜVENLİK:</strong> Veriler açık metin olarak saklanmaz, AES-256 ile xifrelenir. Kullanıcının xifresini çaldırmasından doğacak sızıntılardan yazılım firması sorumlu tutulamaz.</p>
          <p><strong>5. DİJİTAL İMZA, LOGLAMA VE KANIT NİTELİĞİ:</strong> Sisteme girix yapılan tarih, saat, donanım kimliği, IP adresi 5651 sayılı kanun çerçevesinde "Dijital Onay ve İmza" niteliğinde değixtirilemez xekilde saklanacaktır.</p>
        </div>
      </details>

      <div className="bg-surface border border-border-color rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted-foreground text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4 border-b border-border-color">Firma / Personel</th>
                <th className="px-6 py-4 border-b border-border-color">Tarih & Saat</th>
                <th className="px-6 py-4 border-b border-border-color">Versiyon</th>
                <th className="px-6 py-4 border-b border-border-color">IP Adresi</th>
                <th className="px-6 py-4 border-b border-border-color">Cihaz Bilgisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    Henüz dijital onay kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">
                          {log.user.firstName} {log.user.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" /> {log.firm?.name || "Bilinmeyen Firma"} ({log.user.role})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {format(new Date(log.acceptedAt), "dd MMMM yyyy HH:mm:ss", { locale: tr })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-lg border border-green-500/20">
                        {log.documentVersion}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate" title={log.userAgent || ""}>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        {log.userAgent}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
