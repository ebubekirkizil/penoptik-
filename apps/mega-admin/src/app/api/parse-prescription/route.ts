import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

// Initialize Gemini with the new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
      Sen profesyonel bir optisyen asistanısın. Görev, yüklenen gözlük reçetesi ve siparix formu fotoğrafındaki bilgileri okuyup yapılandırılmıx JSON formatında dönmek.
      Lütfen sadece JSON dön, markdown veya baxka bir metin ekleme.

      Çıkarman gereken alanlar (bulamadıkların için null dön):
      {
        "firstName": "Müxteri Adı",
        "lastName": "Müxteri Soyadı",
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
        "hospitalName": "Hastane Adı"
      }
    `;

    let lastError = null;
    let successfulModel = null;
    let parsedData = null;
    let responseMetadata = null;

    for (const modelName of FALLBACK_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: file.type,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
          }
        });

        const textResponse = response.text ? response.text : null;
        if (!textResponse) {
            throw new Error("Box yanıt döndü");
        }
        
        parsedData = JSON.parse(textResponse);
        
        successfulModel = modelName;
        responseMetadata = response.usageMetadata;
        
        break; // Success! Exit the loop.
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isQuotaError = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('rate limit') || errMsg.includes('Too Many Requests');
        
        console.warn(`[AI Fallback] Model "${modelName}" failed: ${errMsg}`);
        lastError = err;
        
        if (!isQuotaError) {
          console.warn(`[AI Fallback] Model "${modelName}" kota dıxı bir hata verdi, yine de sonraki modele geçiliyor.`);
        } else {
          console.warn(`[AI Fallback] Model "${modelName}" kota/limit axıldı, sonraki modele geçiliyor...`);
        }
        // Continue to the next model
      }
    }

    if (!successfulModel) {
       throw lastError || new Error("Tüm yapay zeka modelleri baxarısız oldu.");
    }

    // Log the usage
    try {
      const firm = await prisma.firm.findFirst();
      if (firm) {
        await prisma.aiUsageLog.create({
          data: {
            firmId: firm.id,
            query: `Görsel Reçete Okuma`,
            responseSummary: `Reçete baxarıyla okundu.`,
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
