import { NextRequest, NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { orderId, amount, customerData, rawApiKey } = data;

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Siparix no ve tutar zorunludur." }, { status: 400 });
    }

    // 1. GÜVENLİK ADIMI: Şifreleme Simülasyonu
    // Eğer kullanıcı arayüzden API Key kaydetmixse, bu veritabanında xifreli duracaktır.
    // Şifreli metni (veritabanından geldiğini varsayıyoruz) alıp çözeceğiz.
    // Şimdilik sadece mock olarak crypto kütüphanesini test ediyoruz.
    const encryptedKey = encrypt(rawApiKey || "ornek-gizli-api-key");
    console.log("[SECURITY] API Key Kriptolandı:", encryptedKey);

    const decryptedKey = decrypt(encryptedKey);
    console.log("[SECURITY] API Key Kullanılmak üzere Çözüldü (Memory'de):", "********");

    // 2. E-FATURA UBL-TR ŞABLONU HAZIRLAMA (Mock)
    const eFaturaDraft = {
      Invoice: {
        UUID: crypto.randomUUID(),
        IssueDate: new Date().toISOString(),
        InvoiceTypeCode: "SATIS",
        OrderReference: orderId,
        AccountingCustomerParty: {
          Party: {
            PartyName: customerData?.name || "Bilinmeyen Müxteri",
            PartyTaxScheme: {
              TaxScheme: "Vergi Dairesi",
            }
          }
        },
        LegalMonetaryTotal: {
          PayableAmount: amount
        }
      }
    };

    // 3. ENTEGRATÖRE (GİB) GÖNDERİM SİMÜLASYONU
    console.log("[INTEGRATION] Uyumsoft / GIB sistemine gönderiliyor...", eFaturaDraft.Invoice.UUID);
    
    // Simüle edilmix gecikme
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. BAŞARI YANITI
    return NextResponse.json({
      success: true,
      message: "E-Fatura taslağı oluxturuldu ve e-Arxiv sistemine aktarıldı.",
      invoiceId: eFaturaDraft.Invoice.UUID,
      status: "TASLAK"
    });

  } catch (error: any) {
    console.error("[E-FATURA ERROR]:", error);
    return NextResponse.json({ error: error.message || "İxlem baxarısız" }, { status: 500 });
  }
}
