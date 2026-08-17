import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY ortam değişkeni tanımlı değil. Lütfen .env dosyanızı kontrol edin." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: "Lütfen bir ses dosyası yükleyin." }, { status: 400 });
    }

    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    const systemPrompt = `
      Sen profesyonel bir optisyen ve genel sipariş/reçete kayıt asistanısın.
      Kullanıcı (optisyen) mikrofon üzerinden sana yeni bir müşteri kaydı, yeni bir gözlük reçetesi veya sipariş bilgisi yazdırıyor.
      Görevin, bu ses kaydını dinleyerek aşağıdaki JSON şemasına uygun şekilde verileri ayıklamaktır.
      Eğer bir veri ses kaydında geçmiyorsa (örneğin tc kimlik no veya cam tipi söylenmediyse), o alana null veya boş string koy.
      Eğer müşteri adının başında "Kayıtlı müşterimiz" veya benzeri bir ifade varsa, isNewCustomer: false yap, aksi takdirde true yap.

      LÜTFEN SADECE AŞAĞIDAKİ JSON ŞEMASINDA YANIT VER. BAŞKA HİÇBİR MARKDOWN VEYA METİN EKLEME.
      
      {
        "isNewCustomer": boolean,
        "customer": {
          "firstName": "Müşteri Adı",
          "lastName": "Müşteri Soyadı",
          "phone": "Telefon numarası (rakamlar)",
          "tcNo": "TC Kimlik No",
          "email": "E-posta",
          "address": "Adres"
        },
        "order": {
          "totalPrice": number (Sipariş tutarı),
          "downPayment": number (Kapora / peşinat tutarı),
          "installments": number (Taksit sayısı, yoksa 1),
          "deliveryDate": "Teslim tarihi notu (örn: haftaya cuma)"
        },
        "prescription": {
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
          "notes": "Özel notlar veya açıklamalar"
        }
      }
    `;

    let cleanMimeType = (audioFile.type || "audio/webm").split(";")[0].trim();
    if (!cleanMimeType || cleanMimeType === "application/octet-stream") {
      cleanMimeType = "audio/webm";
    }

    const FALLBACK_MODELS = [
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.0-pro"
    ];
    
    let aiResponse = null;
    let lastErrorMsg = "";
    
    for (const modelName of FALLBACK_MODELS) {
      // 2 kez deneme (retry) yapalım rate-limit durumları için
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          aiResponse = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: "user",
                parts: [
                  { text: systemPrompt },
                  {
                    inlineData: {
                      mimeType: cleanMimeType,
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
          
          if (aiResponse && aiResponse.text) {
             break;
          }
        } catch (e: any) {
          lastErrorMsg = e.message || String(e);
          console.warn(`[AI Voice Fallback] Model "${modelName}" attempt ${attempt + 1} failed: ${lastErrorMsg}`);
          // Eğer 429 Rate Limit uyarısı aldıysak 3 saniye bekleyip tekrar deneyelim
          if (lastErrorMsg.includes("429") || lastErrorMsg.includes("RESOURCE_EXHAUSTED") || lastErrorMsg.includes("quota")) {
            await new Promise((r) => setTimeout(r, 3000));
          } else {
            break; // 429 dışındaki hatalarda diğer modele geç
          }
        }
      }
      if (aiResponse && aiResponse.text) break;
    }

    if (!aiResponse || !aiResponse.text) {
      if (lastErrorMsg.includes("429") || lastErrorMsg.includes("RESOURCE_EXHAUSTED") || lastErrorMsg.includes("quota")) {
        throw new Error("Ücretsiz dakikalık kullanım sınırı aşıldı (Saniyede çok fazla istek yapıldı). Lütfen 5-10 saniye bekleyip tekrar deneyin.");
      }
      throw new Error("Tüm yapay zeka modelleri meşgul. Lütfen birkaç saniye sonra tekrar deneyin.");
    }

    const parsedJson = JSON.parse(aiResponse.text);
    return NextResponse.json({ success: true, data: parsedJson });

  } catch (error: any) {
    console.error("Voice AI Error:", error);
    return NextResponse.json(
      { error: "Ses işlenirken bir hata oluştu: " + (error.message || "") },
      { status: 500 }
    );
  }
}
