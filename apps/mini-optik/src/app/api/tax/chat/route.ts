import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // GEMINI_API_KEY yoksa mock bir cevap dön (local testler için)
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        text: "Sistem mesajı: GEMINI_API_KEY ayarlanmadığı için AI botu geçici olarak devre dışı. Ancak Türkiye vergi optimizasyonları için size genel stratejiler sunabilirim. Lütfen geçerli bir API anahtarı ekleyin." 
      });
    }

    const systemInstruction = `Sen İMPECTA uygulamasının "Akıllı Vergi Optimizasyonu ve Muhasebe Asistanı"sın.
Türkiye Cumhuriyeti vergi yasaları, anayasası, muhasebe standartları ve şirket türlerine (Şahıs, Limited, Anonim) tam hakim profesyonel bir uzmansın.
Görevlerin:
1. Kullanıcılara yasal sınırlar içerisinde "vergiden kaçınma" (vergi optimizasyonu) stratejileri sunmak (Amortisman yöntemleri, Teknokent/Ar-Ge teşvikleri, şüpheli alacaklar vb.).
2. Güncel politikaları kullanıcılara hatırlatmak: 
   - SGK Giderleri ve Yemek/Yol ödeneklerinin matrahtan nasıl düşüleceği.
   - Yazılım, Mimarlık, Mühendislik gibi Hizmet İhracatlarında %80 kazanç istisnası (Ancak bu istisnanın şartı: Ödemenin döviz (Euro/Dolar vb.) cinsinden Türkiye'ye getirilmiş olmasıdır, bunu mutlaka belirt!).
   - Genç Girişimci İstisnası ve şartları.
3. Gelir vergisi (artan oranlı), Kurumlar vergisi, KDV, Stopaj (Muhtasar) gibi vergilerin nasıl ödendiği ve hesaplandığı konusunda detaylı bilgi vermek.
4. Sorulara net, profesyonel ve yasalara uygun cevaplar vermek.

KURALLAR:
- Sadece vergi, finans, muhasebe, şirket kurulumu ve teşvikler hakkında konuş. Başka konuları reddet.
- Tavsiyelerinin sonuna her zaman: "Yasal Uyarı: Bu bilgiler genel tavsiye niteliğindedir. Uygulamaya geçmeden önce lütfen resmi Mali Müşavirinize danışınız." notunu ekle.`;

    // messages format: [{ role: 'user', parts: [{text: 'merhaba'}] }]
    // We assume the frontend sends the format that Google Gen AI expects or we map it.
    // Assuming simple { role: 'user' | 'model', text: '...' } from frontend
    
    const FALLBACK_MODELS = [
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-3.6-flash"
    ];

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    let responseStream;
    let successfulModel = "";

    for (const modelName of FALLBACK_MODELS) {
      try {
        responseStream = await ai.models.generateContentStream({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.3,
          }
        });
        successfulModel = modelName;
        break;
      } catch (err: any) {
        console.warn(`[Tax Chat Fallback] Model "${modelName}" failed: ${err.message || String(err)}`);
      }
    }

    if (!responseStream) {
       return NextResponse.json({ error: 'Tüm AI modelleri şu anda meşgul veya kotası dolmuş.' }, { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
        } catch (e) {
          console.error("Stream error with model", successfulModel, ":", e);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Tax AI API Error:', error);
    return NextResponse.json({ error: 'AI servisi ile iletişim kurulamadı.' }, { status: 500 });
  }
}
