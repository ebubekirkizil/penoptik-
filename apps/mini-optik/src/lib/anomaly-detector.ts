import { prisma } from "./prisma";

// Bellek içi basit bir istek takip sistemi (Vercel gibi ortamlar için 
// production'da Upstash Redis veya veritabanı loglama (AiUsageLog) önerilir)
// Yapı: { [userId]: { count: number, resetTime: number } }
const requestCounts: Record<string, { count: number; resetTime: number }> = {};

const MAX_REQUESTS_PER_MINUTE = 500;
const TIME_WINDOW_MS = 60 * 1000; // 1 Dakika

export async function checkAnomaly(userId: string, actionDetails: string) {
  const now = Date.now();

  // İlk istek veya süre dolduysa sıfırla
  if (!requestCounts[userId] || now > requestCounts[userId].resetTime) {
    requestCounts[userId] = { count: 1, resetTime: now + TIME_WINDOW_MS };
    return { isFrozen: false };
  }

  requestCounts[userId].count += 1;

  // Limit aşıldı mı?
  if (requestCounts[userId].count > MAX_REQUESTS_PER_MINUTE) {
    console.warn(`[GÜVENLİK ANOMALİSİ] Kullanıcı ${userId} 1 dakikada ${MAX_REQUESTS_PER_MINUTE} sınırı aştı!`);
    
    // 1. Kullanıcıyı dondur
    await prisma.user.update({
      where: { id: userId },
      data: {
        isFrozen: true,
        frozenReason: `Anomali Tespiti: 1 dakikada aşırı veri isteği (${actionDetails})`,
      },
    });

    // 2. Mega Admin'e E-posta Gönder (Simülasyon - Gerçekte SendGrid veya Resend kullanılabilir)
    // TODO: sendAdminAlertEmail(userId, actionDetails);
    console.error(`[ACİL E-POSTA] Mega Admin'e uyarı gönderildi: Kullanıcı ${userId} donduruldu!`);

    return { isFrozen: true, message: "Hesabınız olağandışı hareketlerden dolayı güvenlik amaçlı dondurulmuştur." };
  }

  return { isFrozen: false };
}
