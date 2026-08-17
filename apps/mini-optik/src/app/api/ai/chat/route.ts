import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { getStatusConfig } from "@/lib/statusConfig";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    // 1. Settings ve AI Bot yetki kontrolü
    const settings = await prisma.settings.findFirst({ where: { id: "global" } });
    if (settings && settings.isAiBotActive === false) {
      return NextResponse.json(
        { error: "Yapay zeka botu yöneticiniz (Mega Admin) tarafından geçici olarak devreden çıkarılmıştır." },
        { status: 403 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY ortam değişkeni tanımlı değil. Lütfen .env dosyanızı kontrol edin." },
        { status: 500 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let message = "";
    let history: any[] = [];
    let files: File[] = [];

    // 2. GÖRSEL / ÇOKLU KAMERA VE GALERİ MODU VEYA EKLİ SOHBET (FormData)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      message = (formData.get("message") as string) || "";
      try { history = JSON.parse((formData.get("history") as string) || "[]"); } catch(e){}

      let allFiles = formData.getAll("files") as File[];
      if (!allFiles || allFiles.length === 0) {
        const singleFile = formData.get("file") as File;
        if (singleFile) allFiles = [singleFile];
      }
      if (allFiles && allFiles.length > 0) files = allFiles;

      if (!message) {
        if (files.length === 0) {
          return NextResponse.json({ error: "Lütfen en az 1 görsel yükleyin." }, { status: 400 });
        }

      // Maksimum 10 görsel sınırı
      if (files.length > 10) {
        files = files.slice(0, 10);
      }

      const ocrPrompt = `
        Sen profesyonel bir optisyen ve tıbbi reçete OCR uzmanısın.
        Sana verilen el yazısı veya basılı gözlük reçetesi / sipariş formu fotoğrafındaki tüm verileri oku.
        Aşağıdaki JSON şemasına BİREBİR UYGUN JSON formatında yanıt dön. Başka hiçbir markdown veya ekstra açıklama yazma.

        {
          "firstName": "Müşteri Adı (Yoksa null)",
          "lastName": "Müşteri Soyadı (Yoksa null)",
          "phone": "Telefon numarası (Sadece rakamlar, örn: 05551234567, yoksa null)",
          "tcNo": "TC Kimlik No (Rakamlar, yoksa null)",
          "address": "Müşteri adresi (yoksa null)",
          "farRightSph": "Uzak Sağ SPH",
          "farRightCyl": "Uzak Sağ CYL",
          "farRightAx": "Uzak Sağ AX",
          "farLeftSph": "Uzak Sol SPH",
          "farLeftCyl": "Uzak Sol CYL",
          "farLeftAx": "Uzak Sol AX",
          "nearRightSph": "Yakın Sağ SPH",
          "nearRightCyl": "Yakın Sağ CYL",
          "nearRightAx": "Yakın Sağ AX",
          "nearLeftSph": "Yakın Sol SPH",
          "nearLeftCyl": "Yakın Sol CYL",
          "nearLeftAx": "Yakın Sol AX",
          "constantRightSph": "Daimi Sağ SPH",
          "constantRightCyl": "Daimi Sağ CYL",
          "constantRightAx": "Daimi Sağ AX",
          "constantLeftSph": "Daimi Sol SPH",
          "constantLeftCyl": "Daimi Sol CYL",
          "constantLeftAx": "Daimi Sol AX",
          "addRight": "Sağ ADD",
          "addLeft": "Sol ADD",
          "pdRight": "Sağ PD",
          "pdLeft": "Sol PD",
          "pdTotal": "Toplam PD",
          "phRight": "Sağ PH",
          "phLeft": "Sol PH",
          "lensType": "Cam Cinsi / Tipi",
          "coating": "Kaplama türü",
          "doctorName": "Doktor Adı Soyadı",
          "hospitalName": "Hastane / Klinik Adı",
          "notes": "Özel notlar veya açıklamalar"
        }
      `;

      const batchResults = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString("base64");

        const FALLBACK_MODELS = [
          "gemini-3.5-flash-lite",
          "gemini-3.1-flash-lite",
          "gemini-3.5-flash",
          "gemini-2.5-flash",
          "gemini-3.6-flash",
          "gemini-2.0-flash"
        ];
        
        let visionResponse = null;
        for (const modelName of FALLBACK_MODELS) {
           try {
              visionResponse = await ai.models.generateContent({
                model: modelName,
                contents: [
                  {
                    role: "user",
                    parts: [
                      { text: ocrPrompt },
                      {
                        inlineData: {
                          mimeType: file.type || "image/jpeg",
                          data: base64Data,
                        },
                      },
                    ],
                  },
                ],
                config: {
                  responseMimeType: "application/json",
                },
              });
              
              if (visionResponse && visionResponse.text) {
                 break;
              }
           } catch (e: any) {
              console.warn(`[AI Vision Fallback] Model "${modelName}" failed: ${e.message || String(e)}`);
           }
        }

        try {
          if (!visionResponse || !visionResponse.text) {
             throw new Error("Tüm modeller başarısız oldu veya boş yanıt döndü.");
          }
          const ocrText = visionResponse.text;
          const parsedRx = JSON.parse(ocrText);

          // Check if customer exists in DB
          let cleanPhone = parsedRx.phone ? String(parsedRx.phone).replace(/\D/g, "") : "";
          if (cleanPhone.length > 10 && cleanPhone.startsWith("90")) {
            cleanPhone = "0" + cleanPhone.slice(2);
          } else if (cleanPhone.length === 10 && !cleanPhone.startsWith("0")) {
            cleanPhone = "0" + cleanPhone;
          }

          let existingCustomer = null;
          if (cleanPhone) {
            existingCustomer = await prisma.customer.findFirst({
              where: { phone: cleanPhone, deletedAt: null },
            });
          }

          batchResults.push({
            id: `rx_${Date.now()}_${i}`,
            fileName: file.name,
            parsedRx,
            existingCustomer,
            isNewCustomer: !existingCustomer,
          });
        } catch (err: any) {
          console.error(`OCR Error for file ${file.name}:`, err);
          batchResults.push({
            id: `rx_err_${Date.now()}_${i}`,
            fileName: file.name,
            error: "Görsel koruma/okuma hatası",
            parsedRx: { firstName: "", lastName: "", phone: "", lensType: "" },
          });
        }
      }

      // Single file direct auto-save fallback if only 1 image uploaded
      if (files.length === 1 && batchResults[0] && !batchResults[0].error) {
        const item = batchResults[0].parsedRx;
        let cleanPhone = item.phone ? String(item.phone).replace(/\D/g, "") : "";
        if (cleanPhone.length > 10 && cleanPhone.startsWith("90")) {
          cleanPhone = "0" + cleanPhone.slice(2);
        } else if (cleanPhone.length === 10 && !cleanPhone.startsWith("0")) {
          cleanPhone = "0" + cleanPhone;
        }

        let customer = batchResults[0].existingCustomer;
        let createdNewCustomer = false;

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              firstName: item.firstName || "İsimsiz",
              lastName: item.lastName || "Müşteri",
              phone: cleanPhone || `05${Math.floor(100000000 + Math.random() * 900000000)}`,
              tcNo: item.tcNo || null,
              address: item.address || null,
              notes: "AI Reçete Okuyucu ile otomatik oluşturuldu.",
            },
          });
          createdNewCustomer = true;
        }

        let existingPrescription = null;

        if (!createdNewCustomer) {
          // Check if the exact same prescription already exists for this customer
          existingPrescription = await prisma.prescription.findFirst({
            where: {
              customerId: customer.id,
              farRightSph: item.farRightSph || null,
              farRightCyl: item.farRightCyl || null,
              farRightAx: item.farRightAx || null,
              farLeftSph: item.farLeftSph || null,
              farLeftCyl: item.farLeftCyl || null,
              farLeftAx: item.farLeftAx || null,
              nearRightSph: item.nearRightSph || null,
              nearLeftSph: item.nearLeftSph || null,
            },
            orderBy: { createdAt: "desc" }
          });
        }

        let prescription;
        let isDuplicate = false;

        if (existingPrescription) {
          prescription = existingPrescription;
          isDuplicate = true;
        } else {
          prescription = await prisma.prescription.create({
            data: {
              customerId: customer.id,
              farRightSph: item.farRightSph || null,
              farRightCyl: item.farRightCyl || null,
              farRightAx: item.farRightAx || null,
              farLeftSph: item.farLeftSph || null,
              farLeftCyl: item.farLeftCyl || null,
              farLeftAx: item.farLeftAx || null,
              nearRightSph: item.nearRightSph || null,
              nearRightCyl: item.nearRightCyl || null,
              nearRightAx: item.nearRightAx || null,
              nearLeftSph: item.nearLeftSph || null,
              nearLeftCyl: item.nearLeftCyl || null,
              nearLeftAx: item.nearLeftAx || null,
              constantRightSph: item.constantRightSph || null,
              constantRightCyl: item.constantRightCyl || null,
              constantRightAx: item.constantRightAx || null,
              constantLeftSph: item.constantLeftSph || null,
              constantLeftCyl: item.constantLeftCyl || null,
              constantLeftAx: item.constantLeftAx || null,
              addRight: item.addRight || null,
              addLeft: item.addLeft || null,
              pdRight: item.pdRight || null,
              pdLeft: item.pdLeft || null,
              pdTotal: item.pdTotal || null,
              phRight: item.phRight || null,
              phLeft: item.phLeft || null,
              lensType: item.lensType || null,
              coating: item.coating || null,
              doctorName: item.doctorName || null,
              hospitalName: item.hospitalName || null,
              notes: item.notes || "AI OCR ile otomatik oluşturuldu.",
            },
          });
        }

        let smartReply = "";
        if (isDuplicate) {
          smartReply = `⚠️ **Mükerrer Kayıt Uyarısı:** Bu reçete değerleri zaten **${customer.firstName} ${customer.lastName}** adlı müşteride kayıtlı. (Aynı görseli veya aynı değerleri ikinci kez yüklemiş olabilirsiniz, yeni bir reçete kaydı oluşturulmadı).`;
        } else if (createdNewCustomer) {
          smartReply = `✅ Reçete okundu! **${customer.firstName} ${customer.lastName}** adıyla sistemde yeni bir müşteri profili oluşturuldu ve bu reçete profiline işlendi.`;
        } else {
          smartReply = `ℹ️ **Akıllı Eşleşme:** Sistemde halihazırda kayıtlı olan **${customer.firstName} ${customer.lastName}** müşterisi bulundu. Yüklediğiniz bu yeni reçete, mevcut müşterinin profiline başarıyla eklendi!`;
        }

        return NextResponse.json({
          mode: "vision",
          isBatch: false,
          reply: smartReply,
          parsedRx: item,
          customer,
          prescription,
          createdNewCustomer,
          batchResults,
        });
      }

      // Return batch preview for multi-file review & edit drawer
      return NextResponse.json({
        mode: "vision",
        isBatch: true,
        reply: `${files.length} adet reçete fotoğrafı başarıyla analiz edildi! Lütfen aşağıdan okunan bilgileri kontrol edip **'Tümünü Onayla ve Kaydet'** butonuna basın.`,
        batchResults,
      });
      } // end of if (!message)
    } else {
      const body = await req.json();
      message = body.message;
      history = body.history || [];
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. NORMAL METİN SOHBETİ VEYA GÖRSELLİ SOHBET MODU
    // ═══════════════════════════════════════════════════════════════
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Lütfen bir mesaj metni girin." }, { status: 400 });
    }

    // ── Tarih Hesaplamaları (Türkiye UTC+3) ──
    const nowUtc = new Date();
    const today = new Date(nowUtc.getTime() + (3 * 60 * 60 * 1000));
    const trYear = today.getUTCFullYear();
    const trMonth = today.getUTCMonth();
    const trDay = today.getUTCDate();
    const startOfToday = new Date(Date.UTC(trYear, trMonth, trDay, 0, 0, 0, 0) - (3 * 60 * 60 * 1000));
    const firstDayOfMonth = new Date(Date.UTC(trYear, trMonth, 1, 0, 0, 0, 0) - (3 * 60 * 60 * 1000));

    // ── Veritabanından Canlı Veriler ──
    const [
      customerCount,
      orderCount,
      prescriptionCount,
      recentCustomers,
      recentOrders,
      statusConfig,
      monthlyOrders,
      todayCustomersCount,
      todayOrdersCount
    ] = await Promise.all([
      prisma.customer.count({ where: { deletedAt: null } }),
      prisma.opticOrder.count({ where: { deletedAt: null } }),
      prisma.prescription.count({ where: { deletedAt: null } }),
      prisma.customer.findMany({
        take: 10, orderBy: { createdAt: "desc" }, where: { deletedAt: null },
        select: { firstName: true, lastName: true, phone: true, createdAt: true }
      }),
      prisma.opticOrder.findMany({
        take: 10, orderBy: { createdAt: "desc" }, where: { deletedAt: null },
        include: { customer: { select: { firstName: true, lastName: true } } }
      }),
      getStatusConfig(),
      prisma.opticOrder.findMany({
        where: { deletedAt: null, createdAt: { gte: firstDayOfMonth } },
        select: { totalPrice: true, deposit: true }
      }),
      prisma.customer.count({ where: { deletedAt: null, createdAt: { gte: startOfToday } } }),
      prisma.opticOrder.count({ where: { deletedAt: null, createdAt: { gte: startOfToday } } })
    ]);

    let monthlyRevenue = 0;
    let monthlyDeposits = 0;
    monthlyOrders.forEach(o => {
      monthlyRevenue += (o.totalPrice || 0);
      monthlyDeposits += (o.deposit || 0);
    });
    const monthlyBalance = monthlyRevenue - monthlyDeposits;

    // Son müşteriler özet metni
    const recentCustomersSummary = recentCustomers.map((c, i) =>
      `${i + 1}. ${c.firstName} ${c.lastName} (Tel: ${c.phone || "Belirtilmemiş"}, Kayıt: ${new Date(c.createdAt).toLocaleDateString("tr-TR")})`
    ).join("\n      ");

    // Son siparişler özet metni
    const recentOrdersSummary = recentOrders.map((o: any, i: number) =>
      `${i + 1}. ${o.customer?.firstName || ""} ${o.customer?.lastName || ""} → ${o.products || "Ürün belirtilmemiş"} | Tutar: ${o.totalPrice?.toLocaleString("tr-TR") || 0} TL | Durum: ${o.status} | Tarih: ${new Date(o.createdAt).toLocaleDateString("tr-TR")}`
    ).join("\n      ");

    // ── Yapay Zeka Sistem Talimatı ──
    const systemInstruction = `Sen 'Pen AI Bot'sun — Pen Optik otomasyon sisteminin yapay zeka asistanısın. 
Kullanıcın optisyen dükkanı sahibi veya personeldir. Profesyonel ama samimi Türkçe ile yanıt ver. 
Kısa ve öz ol; robotik ezber metinler YASAK. Doğal konuş, sorulana odaklan.

═══ CANLI VERİTABANI VERİLERİ ═══
• Toplam Müşteri: ${customerCount} kişi
• Toplam Sipariş: ${orderCount} adet  
• Toplam Reçete/Göz Bilgisi: ${prescriptionCount} adet
• Bugün Eklenen Müşteri: ${todayCustomersCount} | Bugün Açılan Sipariş: ${todayOrdersCount}
• Bu Ay Toplam Ciro: ${monthlyRevenue.toLocaleString("tr-TR")} TL
• Bu Ay Toplam Kapora/Tahsilat: ${monthlyDeposits.toLocaleString("tr-TR")} TL
• Bu Ay Kalan Bakiye: ${monthlyBalance.toLocaleString("tr-TR")} TL
• Sipariş Durumları: ${statusConfig.map((s) => s.label).join(", ")}

═══ SON 10 MÜŞTERİ ═══
      ${recentCustomersSummary || "Henüz müşteri kaydı yok."}

═══ SON 10 SİPARİŞ ═══
      ${recentOrdersSummary || "Henüz sipariş kaydı yok."}

═══ İNİSİYATİF ALMA KURALLARI ═══
1. Kullanıcı birebir resmi terim kullanmak zorunda değil:
   • "Reçete/Göz bilgisi/Göz derecesi/Numara/Kağıt" → REÇETE demektir (${prescriptionCount} adet)
   • "Sipariş/Satış/İş/Alışveriş" → SİPARİŞ demektir (${orderCount} adet)
   • "Müşteri/Hasta/Kişi/Adam" → MÜŞTERİ demektir (${customerCount} kişi)
   • "Ciro/Kazanç/Gelir/Para" → CİRO demektir (${monthlyRevenue.toLocaleString("tr-TR")} TL)
2. Kullanıcı birden fazla şey sorabilir ("Kaç müşteri ve reçete var?"), hepsine TEK yanıtta cevap ver.
3. Kullanıcı imalı konuşursa, en yakın anlamı çıkar ve net bilgiyle yanıtla.
4. Sayısal sorularda DAİMA yukarıdaki veritabanı değerlerini kullan; tahmin YAPMA.
5. Sipariş oluşturma talebi geldiğinde (isim, ürün, fiyat, kapora, taksit bilgileri) orderData içinde bunları ayıkla.
6. HAFIZA & DEVAMLILIK: Sana geçmiş konuşmalar (History) iletiliyor. Kullanıcı "Aynı siparişi şu kişiye de yap" veya "Numarası 555 olan kişiye de aynısını gir" veya "önceki kişiye devam et" derse, geçmişteki müşteri telefon numarasını, sipariş ürün, fiyat, taksit, kapora verilerini HATIRLA ve orderData içerisine mutlaka bas! Müşteri kayıt panelinde hepsi tek seferde oluşturulacaktır.
7. INTENT (NİYET) BELİRLEME: Kullanıcı sadece SPH, CYL gibi göz derecelerini söylüyorsa intentType "PRESCRIPTION" olmalıdır. Kullanıcı fiyat, ürün, taksit söylüyorsa "ORDER" olmalıdır. Hem fiyat hem göz derecesi varsa "BOTH" olmalıdır. Eğer kullanıcı "gelir ekle, gider ekle, fatura gir" diyorsa "FINANCE" olmalıdır. "Stok ekle, şu üründen geldi" diyorsa "INVENTORY" olmalıdır. Aksi halde "NONE" olmalıdır.
8. ÖZEL ALANLAR: "Cam tipi", "cam", "odak" kelimeleri geçerse (Örn: progresif, tek odaklı) bunu "lensType" alanına yaz. "Kaplama", "antirefle" vb. geçerse "coating" alanına yaz.
9. KAYITLI MÜŞTERİ TESPİTİ: Kullanıcı "bir önceki kişiye", "o kişiye" veya geçmişte bahsettiği bir isme (Örn: "Mustafa'ya") yeni bir işlem ekliyorsa "isExistingCustomer" alanını true gönder. Tamamen yeni bir müşteri kaydediyorsa false gönder.
10. ÖZEL TAKSİT TARİHLERİ: Kullanıcı belirli tarihler ve tutarlarla taksit belirtirse (örn: 10 Kasım 2000 TL, 15 Aralık 1000 TL), bunları "installments" dizisine ekle. Tarihleri YYYY-MM-DD formatına çevir.
11. FİNANS VE STOK: Kullanıcı finansal bir eylem (fatura, gider) belirtirse 'financeData' içine çıkar. Stok belirtirse 'inventoryData' içine çıkar. Stok eklerken ürün adı veya kodu ve gelen adet zorunludur. Eğer kullanıcı bir görsel (barkod/ürün fotoğrafı) yüklemişse, görseldeki barkod numarasını, ürün modelini veya etiket bilgisini oku ve istenen işleme (stok ekleme, çıkarma veya sipariş) dahil et.

═══ YANIT FORMATI ═══
Yanıtını SADECE aşağıdaki JSON formatında dön. Markdown, açıklama veya başka metin EKLEME:
{
  "reply": "Kullanıcıya gösterilecek doğal Türkçe yanıt metni",
  "orderData": {
    "isOrderIntent": false,
    "isExistingCustomer": false,
    "intentType": "PRESCRIPTION | ORDER | BOTH | FINANCE | INVENTORY | NONE",
    "firstName": "", "lastName": "", "phone": "", "tcNo": "", "email": "", "address": "",
    "diseases": "", "notes": "", "prescriptionNotes": "",
    "farRightSph": "", "farRightCyl": "", "farRightAx": "",
    "farLeftSph": "", "farLeftCyl": "", "farLeftAx": "",
    "nearRightSph": "", "nearRightCyl": "", "nearRightAx": "",
    "nearLeftSph": "", "nearLeftCyl": "", "nearLeftAx": "",
    "constantRightSph": "", "constantRightCyl": "", "constantRightAx": "",
    "constantLeftSph": "", "constantLeftCyl": "", "constantLeftAx": "",
    "addRight": "", "addLeft": "", "pdRight": "", "pdLeft": "", "pdTotal": "",
    "phRight": "", "phLeft": "", "lensType": "", "coating": "", "doctorName": "", "hospitalName": "",
    "productName": "", "productCode": "", "totalPrice": "", "downPayment": "", "installmentCount": "",
    "installments": [ {"amount": 2000, "date": "YYYY-MM-DD"} ],
    "installmentPeriod": "AYLIK veya HAFTALIK veya GÜNLÜK",
    "deliveryStatus": "Teslim Edildi veya Hazırlanıyor vb."
  },
  "financeData": {
    "type": "INCOME | EXPENSE",
    "amount": 0,
    "category": "",
    "description": ""
  },
  "inventoryData": {
    "type": "ADD | UPDATE",
    "productName": "",
    "productCode": "",
    "quantity": 0,
    "price": 0
  }
}`;

    // ── Gemini Modelleri (Güncel & Çalışan) ──
    const MODELS = [
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-3.6-flash",
      "gemini-2.0-flash"
    ];

    let aiReplyText = "";
    let lastError = "";

    // ── Sohbet Geçmişini Gemini Formatına Çevir ──
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        if (!h.text || h.sender === "system") continue;
        contents.push({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      }
    }
    const userParts: any[] = [{ text: message }];

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64Data = buffer.toString("base64");
          userParts.push({
            inlineData: {
              mimeType: file.type || "image/jpeg",
              data: base64Data,
            },
          });
        } catch (err) {
          console.error("Görsel okunurken hata:", err);
        }
      }
    }

    contents.push({ role: "user", parts: userParts });

    for (const modelName of MODELS) {
      try {
        const result = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: { systemInstruction, temperature: 0.1 }
        });
        if (result?.text) {
          aiReplyText = result.text;
          console.log(`[AI Chat] ✓ Model "${modelName}" başarılı.`);
          break;
        }
      } catch (e: any) {
        lastError = e?.message || String(e);
        console.warn(`[AI Chat] ✗ Model "${modelName}": ${lastError}`);
      }
    }

    // ── AI Yanıtını İşle ──
    if (aiReplyText) {
      try {
        // JSON temizliği
        let clean = aiReplyText.trim();
        if (clean.startsWith("```json")) clean = clean.slice(7);
        if (clean.startsWith("```")) clean = clean.slice(3);
        if (clean.endsWith("```")) clean = clean.slice(0, -3);
        clean = clean.trim();

        const parsed = JSON.parse(clean);
        let pendingData = undefined;
        let openOrderPortal = false;

        const hasCustomerOrIntent = parsed.orderData?.isOrderIntent === true || 
                                    (parsed.orderData?.intentType && parsed.orderData.intentType !== "NONE") ||
                                    Boolean(parsed.orderData?.firstName || parsed.orderData?.lastName || parsed.orderData?.phone || parsed.orderData?.tcNo);

        if (parsed.orderData && hasCustomerOrIntent) {
          openOrderPortal = true;
          
          let count = parseInt(String(parsed.orderData.installmentCount)) || 1;
          let total = parseFloat(String(parsed.orderData.totalPrice).replace(/\./g, "")) || 0;
          let dp = parseFloat(String(parsed.orderData.downPayment).replace(/\./g, "")) || 0;
          let remaining = Math.max(0, total - dp);
          let monthly = count > 0 ? Math.round(remaining / count) : remaining;

          let generatedInstallments: any[] = [];
          if (parsed.orderData.installments && Array.isArray(parsed.orderData.installments) && parsed.orderData.installments.length > 0) {
            generatedInstallments = parsed.orderData.installments.map((inst: any, index: number) => ({
              number: index + 1,
              date: inst.date,
              amount: parseFloat(String(inst.amount).replace(/\./g, "")) || 0
            }));
            count = generatedInstallments.length;
          } else if (count > 1) {
            const period = (parsed.orderData.installmentPeriod || "AYLIK").toUpperCase();
            generatedInstallments = Array.from({ length: count }, (_, i) => {
              const d = new Date();
              if (period === "HAFTALIK") {
                d.setDate(d.getDate() + (i + 1) * 7);
              } else if (period === "GÜNLÜK") {
                d.setDate(d.getDate() + (i + 1));
              } else {
                d.setMonth(d.getMonth() + i + 1); // Varsayılan aylık
              }
              return {
                number: i + 1,
                date: d.toISOString().split("T")[0],
                amount: monthly
              };
            });
          }

          let extractedStatus = parsed.orderData.deliveryStatus || "PREPARING";
          const lowerStatus = extractedStatus.toLowerCase();
          if (lowerStatus.includes("teslim") && !lowerStatus.includes("hazır")) {
            extractedStatus = "DELIVERED";
          } else if (lowerStatus.includes("hazır") && lowerStatus.includes("teslim")) {
            extractedStatus = "READY";
          } else if (lowerStatus.includes("bekle")) {
             extractedStatus = "PENDING";
          } else {
             extractedStatus = "PREPARING";
          }

          pendingData = {
            ...parsed.orderData,
            totalPrice: String(parsed.orderData.totalPrice || ""),
            downPayment: String(parsed.orderData.downPayment || ""),
            installmentCount: String(count),
            installments: generatedInstallments.length > 0 ? generatedInstallments : undefined,
            deliveryStatus: extractedStatus,
            aiNotes: "Yapay zeka asistanı tarafından otomatik dolduruldu."
          };
        }

        return NextResponse.json({
          mode: "text",
          reply: parsed.reply || "İsteğiniz işlendi.",
          pendingCustomerData: pendingData,
          pendingFinanceData: parsed.financeData,
          pendingInventoryData: parsed.inventoryData,
          openOrderPortal: openOrderPortal || undefined
        });
      } catch {
        // JSON parse edilemedi → düz metin olarak dön
        return NextResponse.json({ mode: "text", reply: aiReplyText });
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // YEREL YEDEK SİSTEM (Gemini tamamen erişilemezse)
    // ═══════════════════════════════════════════════════════════════
    console.warn("[AI Chat] Tüm modeller başarısız. Yerel yedek sistem aktif. Son hata:", lastError);
    const ml = message.toLowerCase();

    // İstatistik Sorguları
    if (ml.includes("reçete") || ml.includes("göz bilgisi") || ml.includes("göz derecesi") || ml.includes("numara kayıtlı")) {
      return NextResponse.json({ mode: "text", reply: `Sisteminizde toplam **${prescriptionCount} adet** reçete/göz bilgisi kayıtlıdır.` });
    }
    if (ml.includes("müşteri") && (ml.includes("kaç") || ml.includes("sayı") || ml.includes("toplam"))) {
      return NextResponse.json({ mode: "text", reply: `Sisteminizde toplam **${customerCount}** müşteri kayıtlıdır.` });
    }
    if (ml.includes("sipariş") && (ml.includes("kaç") || ml.includes("sayı") || ml.includes("toplam"))) {
      return NextResponse.json({ mode: "text", reply: `Sisteminizde toplam **${orderCount}** sipariş kayıtlıdır.` });
    }
    if (ml.includes("ciro") || ml.includes("kazanç") || ml.includes("gelir")) {
      return NextResponse.json({ mode: "text", reply: `Bu ayki toplam cironuz **${monthlyRevenue.toLocaleString("tr-TR")} TL**, tahsil edilen kapora **${monthlyDeposits.toLocaleString("tr-TR")} TL**, kalan bakiye **${monthlyBalance.toLocaleString("tr-TR")} TL**'dir.` });
    }

    // Sipariş Oluşturma Niyeti (Fiyat tespit edilince)
    const priceMatches = message.match(/\b(\d{1,3}(?:\.\d{3})+|\d{4,6})\b/g);
    const nums = priceMatches ? priceMatches.map(n => parseInt(n.replace(/\./g, ""), 10)) : [];

    if (nums.length > 0 && (ml.includes("satış") || ml.includes("sipariş") || ml.includes("kapora") || ml.includes("taksit") || ml.includes("ürün"))) {
      const totalPrice = Math.max(...nums);
      let downPayment = "";
      if (ml.includes("kapora") || ml.includes("peşinat")) {
        downPayment = nums.length > 1 ? Math.min(...nums).toString() : "";
      }

      let installmentCount = "1";
      const taksitMatch = ml.match(/(\d+)\s*taksit/);
      if (taksitMatch) installmentCount = taksitMatch[1];
      else if (ml.includes("üç taksit")) installmentCount = "3";
      else if (ml.includes("iki taksit")) installmentCount = "2";

      let count = parseInt(installmentCount) || 1;
      let total = totalPrice || 0;
      let dp = parseInt(downPayment) || 0;
      let remaining = Math.max(0, total - dp);
      let monthly = count > 0 ? Math.round(remaining / count) : remaining;

      let generatedInstallments: any[] = [];
      if (count > 1) {
        generatedInstallments = Array.from({ length: count }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() + i + 1); // Taksitler gelecek aydan başlar
          return {
            number: i + 1,
            date: d.toISOString().split("T")[0],
            amount: monthly
          };
        });
      }

      let deliveryStatus = "Hazırlanıyor";
      if (ml.includes("teslim edildi") || ml.includes("teslimat yapıldı")) deliveryStatus = "Teslim Edildi";
      else if (ml.includes("hazır")) deliveryStatus = "Teslime Hazır";

      let productCode = "";
      const codeMatch = message.match(/(?:kodu|kod)[^\d]*(\d{3,6})/i) || message.match(/\b(\d{4})\b/);
      if (codeMatch) productCode = codeMatch[1];

      let productName = "";
      if (ml.includes("pier kardin") || ml.includes("pierre cardin")) {
        productName = "Pierre Cardin" + (productCode ? ` ${productCode}` : "");
      } else if (ml.includes("armoni")) {
        productName = "Armoni Güneş Gözlüğü";
      } else if (ml.includes("gözlük") || ml.includes("cam") || ml.includes("çerçeve") || ml.includes("ürün")) {
        productName = productCode ? `Optik Ürün ${productCode}` : "Optik Ürün";
      }

      return NextResponse.json({
        mode: "text",
        reply: `Sipariş bilgileriniz alındı! (${totalPrice.toLocaleString("tr-TR")} TL) Lütfen açılan formda detayları kontrol edip onaylayın.`,
        pendingCustomerData: {
          firstName: "", lastName: "", phone: "",
          email: "", address: "", diseases: "", notes: "", prescriptionNotes: "",
          productName: productName, productCode: productCode,
          totalPrice: totalPrice.toString(),
          downPayment: downPayment,
          installmentCount: installmentCount,
          installments: generatedInstallments.length > 0 ? generatedInstallments : undefined,
          deliveryStatus: deliveryStatus,
          aiNotes: "Yerel ayrıştırıcı tarafından dolduruldu (AI geçici olarak erişilemez)."
        },
        openOrderPortal: true
      });
    }

    // Genel selamlama
    if (ml.includes("merhaba") || ml.includes("selam") || ml.includes("günaydın") || ml.includes("iyi günler")) {
      return NextResponse.json({ mode: "text", reply: `Merhaba! Pen Optik asistanınızım. Şu an sistemde ${customerCount} müşteri, ${orderCount} sipariş ve ${prescriptionCount} reçete kaydınız bulunuyor. Size nasıl yardımcı olabilirim?` });
    }

    return NextResponse.json({
      mode: "text",
      reply: `Yapay zeka servisi şu an geçici olarak meşgul, ancak size yardımcı olabilirim. Sisteminizde ${customerCount} müşteri, ${orderCount} sipariş ve ${prescriptionCount} reçete kaydı bulunmaktadır. Detaylı soru sorabilirsiniz.`
    });

  } catch (error: any) {
    console.error("AI Chat API Critical Exception:", error?.message || error);
    return NextResponse.json({
      mode: "text",
      reply: "Yapay zeka servisinde beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin."
    });
  }
}

