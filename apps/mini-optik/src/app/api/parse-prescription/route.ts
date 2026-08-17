import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

// Initialize Gemini with the standard SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-3.6-flash"
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    const prompt = `
      Sen profesyonel bir optisyen asistanısın. Görev, yüklenen gözlük reçetesi ve sipariş formu fotoğrafındaki bilgileri okuyup yapılandırılmış JSON formatında dönmek.
      Lütfen sadece JSON dön, markdown veya başka bir metin ekleme.

      Çıkarman gereken alanlar (bulamadıkların için null dön):
      {
        "firstName": "Müşteri Adı",
        "lastName": "Müşteri Soyadı",
        "phone": "Telefon (Sadece rakamları tut, örn: 05551234567)",
        "address": "Adres",
        "farRightSph": "UZAK SAĞ göz SPH değeri",
        "farRightCyl": "UZAK SAĞ göz CYL değeri",
        "farRightAx": "UZAK SAĞ göz AX değeri",
        "farLeftSph": "UZAK SOL göz SPH değeri",
        "farLeftCyl": "UZAK SOL göz CYL değeri",
        "farLeftAx": "UZAK SOL göz AX değeri",
        "nearRightSph": "YAKIN SAĞ göz SPH değeri",
        "nearRightCyl": "YAKIN SAĞ göz CYL değeri",
        "nearRightAx": "YAKIN SAĞ göz AX değeri",
        "nearLeftSph": "YAKIN SOL göz SPH değeri",
        "nearLeftCyl": "YAKIN SOL göz CYL değeri",
        "nearLeftAx": "YAKIN SOL göz AX değeri",
        "constantRightSph": "DAİMİ SAĞ göz SPH değeri",
        "constantRightCyl": "DAİMİ SAĞ göz CYL değeri",
        "constantRightAx": "DAİMİ SAĞ göz AX değeri",
        "constantLeftSph": "DAİMİ SOL göz SPH değeri",
        "constantLeftCyl": "DAİMİ SOL göz CYL değeri",
        "constantLeftAx": "DAİMİ SOL göz AX değeri",
        "addRight": "SAĞ Adisyon (ADD) değeri",
        "addLeft": "SOL Adisyon (ADD) değeri",
        "pdRight": "SAĞ PD (Pupil Mesafesi) değeri",
        "pdLeft": "SOL PD (Pupil Mesafesi) değeri",
        "pdTotal": "TOPLAM PD (Pupil Mesafesi) değeri",
        "phRight": "SAĞ PH (Pupilya Yüksekliği) değeri",
        "phLeft": "SOL PH (Pupilya Yüksekliği) değeri",
        "lensType": "Cam Cinsi",
        "doctorName": "Doktor Adı",
        "hospitalName": "Hastane Adı",
        "notes": "Müşteri veya sipariş ile ilgili formdaki boşluklara sığmayan tüm yazılar (tutar, kapora, ödendi, tarih vb. notlar). Eğer böyle yazılar varsa, metnin başına 'Kağıdın üzerinde şu bilgiler de yazmaktadır: ' ekle ve en sonuna mutlaka '(Yapay zeka tarafından oluşturulmuştur)' yaz.",
        "prescriptionNotes": "Reçeteye ait doktorun düştüğü veya reçete ile ilgili özel notlar. Eğer bir not bulursan, sonuna mutlaka '(Yapay zeka tarafından oluşturulmuştur)' yaz."
      }
    `;

    let lastError = null;
    let successfulModel = null;
    let parsedData = null;
    let responseMetadata = null;

    for (const modelName of FALLBACK_MODELS) {
      try {
        const ai = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        const response = await ai.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
        ]);
        
        const textResponse = response.response.text();
        if (!textResponse) {
            throw new Error("Boş yanıt döndü");
        }
        
        // Clean potential markdown ticks
        const cleanText = textResponse.replace(/```json/gi, "").replace(/```/gi, "").trim();
        parsedData = JSON.parse(cleanText);
        
        successfulModel = modelName;
        // Optionally capture token usage if available
        responseMetadata = response.response.usageMetadata;
        
        break; // Success! Exit the loop.
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isQuotaError = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('rate limit') || errMsg.includes('Too Many Requests');
        
        console.warn(`[AI Fallback] Model "${modelName}" failed: ${errMsg}`);
        lastError = err;
        
        if (!isQuotaError) {
          // Model hatası kota ile ilgili değilse, bir sonraki modele de geçmeye çalış
          // ama logla ki farkında olalım
          console.warn(`[AI Fallback] Model "${modelName}" kota dışı bir hata verdi, yine de sonraki modele geçiliyor.`);
        } else {
          console.warn(`[AI Fallback] Model "${modelName}" kota/limit aşıldı, sonraki modele geçiliyor...`);
        }
        // Continue to the next model
      }
    }

    if (!successfulModel) {
       throw lastError || new Error("Tüm yapay zeka modelleri başarısız oldu.");
    }

    // Log the usage
    try {
      const firm = await prisma.firm.findFirst();
      if (firm) {
        await prisma.aiUsageLog.create({
          data: {
            firmId: firm.id,
            query: `Görsel Reçete Okuma`,
            responseSummary: `Reçete başarıyla okundu.`,
            source: "GEMINI_AI_VISION",
            modelUsed: successfulModel,
            promptTokens: responseMetadata?.promptTokenCount || 0,
            completionTokens: responseMetadata?.candidatesTokenCount || 0,
            totalTokens: responseMetadata?.totalTokenCount || 0,
          }
        });
      }
    } catch (logErr) {
      console.error("AI Usage Log Error:", logErr);
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Parse Error:", error);
    return NextResponse.json(
      { error: "Belge okunamadı veya format geçersiz. Lütfen resmi net çekip tekrar deneyin.", details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
