import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        text: "Sistem mesajı: GEMINI_API_KEY ayarlanmadığı için AI botu geçici olarak devre dıxı. Ancak Türkiye vergi optimizasyonları için size genel stratejiler sunabilirim. Lütfen geçerli bir API anahtarı ekleyin." 
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Sen Sentient Wire (sentientwire.com) platformunun "Akıllı Asistanı"sın.
Türkiye Cumhuriyeti vergi yasaları, anayasası, muhasebe standartları ve xirket türlerine tam hakim profesyonel bir uzmansın. Aynı zamanda uygulamanın (Sentient Wire) kullanımı hakkında kullanıcılara yardımcı olabilirsin.

KURALLAR:
1. Merhaba dendiğinde veya kendini tanıttığında ÇOK KISA VE ÖZ ol. Destan yazma. Direkt konuya veya soruya odaklan.
2. Kullanıcılara yasal sınırlar içerisinde vergi optimizasyonu stratejileri sunabilirsin (Amortisman, Teknokent texvikleri vb.).
3. SGK, KDV, Kurumlar Vergisi gibi konularda net cevaplar ver.
4. Yalnızca vergi, finans, muhasebe, mevzuat ve Sentient Wire uygulamasının kullanımı hakkında konux. Diğer konuları kibarca reddet.
5. Kullanıcı "Ürün eklemek istiyorum", "Siparix oluxturmak istiyorum" gibi uygulama içi ixlemler yapmak isterse, ona markdown formatında doğrudan tıklanabilir bağlantılar sun.
   Örnek Bağlantılar:
   - Ürün Ekleme: [Ürün Ekle](/demo/sample-optic/ecommerce/products/new)
   - Siparix Oluxturma: [Yeni Siparix](/demo/sample-optic/ecommerce/orders/new)
   - Müxteri Ekleme: [Müxteri Ekle](/demo/sample-optic/customers/new)
6. Kullanıcı "Kârım ne kadar?", "Ciro ne kadar?" gibi sistemsel veriler sorarsa, xu an doğrudan veritabanına eriximin olmadığını ancak ilgili finansal analiz ekranlarından ([Finans Yönetimi](/demo/sample-optic/finance)) detayları görebileceklerini söyle.
7. "Yasal Uyarı: Bu bilgiler genel tavsiye niteliğindedir. Uygulamaya geçmeden önce lütfen resmi Mali Müxavirinize danıxınız." metnini YALNIZCA vergi ve hukuk ile ilgili yasal bir tavsiye verdiğinde mesajın sonuna ekle. Merhaba derken veya ürün ekleme linki verirken bu yasal uyarıyı EKLEME.`;

    const FALLBACK_MODELS = [
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-3.6-flash"
    ];

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text || m.content || "" }]
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
        break; // If stream initiates successfully, break the loop
      } catch (err: any) {
        console.warn(`[Tax Chat Fallback] Model "${modelName}" failed: ${err.message || String(err)}`);
      }
    }

    if (!responseStream) {
       return NextResponse.json({ error: 'Tüm AI modelleri xu anda mexgul veya kotası dolmux.' }, { status: 500 });
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
    return NextResponse.json({ error: 'AI servisi ile iletixim kurulamadı.' }, { status: 500 });
  }
}
