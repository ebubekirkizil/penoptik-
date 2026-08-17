import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasModule } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAllowed = await hasModule("finance");
    if (!isAllowed) {
      return NextResponse.json({ error: "No finance module access" }, { status: 403 });
    }

    const { message, history } = await req.json();
    const lowerMsg = message.toLowerCase();
    
    // ------------------------------------------------------------------
    // İÇ (INTERNAL) BOT KONTROLÜ (Veritabanından doğrudan cevaplama)
    // ------------------------------------------------------------------
    if (lowerMsg.includes("paket") || lowerMsg.includes("abonelik") || lowerMsg.includes("özellikler")) {
      const settings = await prisma.settings.findFirst({ where: { firmId: session.firmId } });
      const plan = settings?.subscriptionPlan || "Temel Paket";
      const status = settings?.subscriptionStatus || "Aktif";
      const replyText = `Şu anda **${plan}** kullanıyorsunuz. Durum: **${status}**. Mevcut modülleriniz: Stok, Finans, CRM ve Danışman özellikleri aktiftir.`;
      
      await prisma.aiUsageLog.create({
        data: { firmId: session.firmId, userId: session.userId, query: message, responseSummary: replyText, source: "INTERNAL_BOT" }
      });

      return NextResponse.json({ reply: replyText });
    }

    if (lowerMsg.includes("ne kadar ödüyorum") || lowerMsg.includes("ücret") || lowerMsg.includes("fatura")) {
      const settings = await prisma.settings.findFirst({ where: { firmId: session.firmId } });
      const plan = settings?.subscriptionPlan || "Temel Paket";
      // Örnek bir fiyatlama tablosu yanıtı
      const replyText = `Kullandığınız paket: **${plan}**. (Ödeme detaylarınız ve geçmiş faturalarınız için Süper Admin panelini ziyaret edebilirsiniz).`;

      await prisma.aiUsageLog.create({
        data: { firmId: session.firmId, userId: session.userId, query: message, responseSummary: replyText, source: "INTERNAL_BOT" }
      });

      return NextResponse.json({ reply: replyText });
    }

    if (lowerMsg.includes("kâr") || lowerMsg.includes("kar ") || lowerMsg.includes("ciro") || lowerMsg.includes("kazanç")) {
      // OpticOrder üzerinden aylık kâr/zarar hesaplama
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const orders = await prisma.opticOrder.findMany({
        where: {
          customer: { firmId: session.firmId },
          createdAt: { gte: startOfMonth },
          deletedAt: null
        }
      });
      
      let totalCiro = 0;
      let totalMaliyet = 0;
      orders.forEach(o => {
        totalCiro += (o.totalPrice || 0);
        totalMaliyet += 0; // Not tracked directly on OpticOrder
      });
      const netKar = totalCiro - totalMaliyet;

      const replyText = `Bu ayki güncel finansal durumunuz:\n- **Toplam Ciro (Satış):** ${totalCiro.toLocaleString("tr-TR")} ₺\n- **Toplam Maliyet:** ${totalMaliyet.toLocaleString("tr-TR")} ₺\n- **Net Kâr:** ${netKar.toLocaleString("tr-TR")} ₺`;

      await prisma.aiUsageLog.create({
        data: { firmId: session.firmId, userId: session.userId, query: message, responseSummary: replyText, source: "INTERNAL_BOT" }
      });

      return NextResponse.json({ reply: replyText });
    }

    // ------------------------------------------------------------------
    // GERÇEK AI ENTEGRASYONU (Google Gemini) - (Eğer iç bot cevap bulamadıysa)
    // ------------------------------------------------------------------
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Sistemde Gemini API anahtarı tanımlı değil. (Lütfen .env dosyasını kontrol edin.)" });
    }

    const systemInstruction = `Sen sadece 'Mini Optik' isimli bir gözlükçü / optik mağazası için özel olarak geliştirilmiş bir Mali Danışman ve Muhasebe asistanısın. 
Görevin, optik mağazası yöneticilerine Türkiye vergi kanunları, muhasebe uygulamaları, karlılık analizi ve finansal yönetim hakkında KESİN VE DOĞRU bilgi vermektir. 
Başka konularda (genel kültür, tarih, yazılım, tıp vb.) sorulan sorulara asla cevap verme ve nazikçe reddet: 'Üzgünüm, ben sadece finans, muhasebe ve optik sektörü vergi mevzuatı hakkında destek sağlamak üzere programlandım.' şeklinde yanıt ver. 
Cevapların daima kısa, net, anlaşılır ve yasalara uygun olmalıdır.`;

    const contents = (history || []).map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const FALLBACK_MODELS = [
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-3.6-flash"
    ];

    let data: any = null;
    let successfulModel = "";
    
    for (const modelName of FALLBACK_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const payload = {
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents
        };

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const respData = await response.json();

        if (response.ok) {
          data = respData;
          successfulModel = modelName;
          break; // Success, exit loop
        } else {
           const errMsg = respData?.error?.message || "Bilinmeyen API Hatası";
           const isQuotaError = response.status === 429 || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');
           console.warn(`[Finance Advisor Fallback] Model "${modelName}" failed: ${errMsg}`);
           if (!isQuotaError) {
              console.warn(`[Finance Advisor Fallback] Model "${modelName}" kota dışı hata verdi.`);
           }
        }
      } catch (err: any) {
        console.warn(`[Finance Advisor Fallback] Request failed for model "${modelName}":`, err);
      }
    }

    if (!data) {
      console.error("Gemini API Error: Tüm modeller başarısız oldu.");
      return NextResponse.json({ reply: "Tüm AI modelleri şu anda meşgul veya kotası dolmuş. Lütfen daha sonra tekrar deneyin." });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Anlayamadım, lütfen tekrar eder misiniz?";

    await prisma.aiUsageLog.create({
      data: { firmId: session.firmId, userId: session.userId, query: message, responseSummary: reply.substring(0, 200) + (reply.length > 200 ? "..." : ""), source: "GEMINI_AI" }
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Advisor Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
