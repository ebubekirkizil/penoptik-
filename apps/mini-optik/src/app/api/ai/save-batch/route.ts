import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Kaydedilecek geçerli reçete verisi bulunamadı." }, { status: 400 });
    }

    const savedResults = [];

    for (const item of items) {
      let cleanPhone = item.phone ? String(item.phone).replace(/\D/g, "") : "";
      if (cleanPhone.length > 10 && cleanPhone.startsWith("90")) {
        cleanPhone = "0" + cleanPhone.slice(2);
      } else if (cleanPhone.length === 10 && !cleanPhone.startsWith("0")) {
        cleanPhone = "0" + cleanPhone;
      }

      let customer = null;
      let createdNewCustomer = false;

      if (cleanPhone) {
        customer = await prisma.customer.findFirst({
          where: { phone: cleanPhone, deletedAt: null },
        });
      }

      if (!customer && item.firstName && item.lastName) {
        customer = await prisma.customer.findFirst({
          where: {
            firstName: { equals: item.firstName, mode: "insensitive" },
            lastName: { equals: item.lastName, mode: "insensitive" },
            deletedAt: null,
          },
        });
      }

      // Otomatik Müşteri Oluştur
      if (!customer) {
        const firstName = item.firstName || "İsimsiz";
        const lastName = item.lastName || "Müşteri";
        const phone = cleanPhone || `05${Math.floor(100000000 + Math.random() * 900000000)}`;

        customer = await prisma.customer.create({
          data: {
            firstName,
            lastName,
            phone,
            tcNo: item.tcNo || null,
            address: item.address || null,
            notes: item.notes || "AI Toplu Reçete Okuyucu tarafından onaylanarak oluşturuldu.",
          },
        });
        createdNewCustomer = true;
      }

      // Reçeteyi Kaydet
      const prescription = await prisma.prescription.create({
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
          notes: item.prescriptionNotes || "AI Çoklu Reçete Okuyucu ile onaylanarak eklendi.",
        },
      });

      savedResults.push({
        customer,
        prescription,
        createdNewCustomer,
      });
    }

    // AI Log
    try {
      const firm = await prisma.firm.findFirst();
      if (firm) {
        await prisma.aiUsageLog.create({
          data: {
            firmId: firm.id,
            query: `Toplu Reçete Onayı (${savedResults.length} adet)`,
            responseSummary: `${savedResults.length} adet reçete kullanıcı onayıyla veritabanına kaydedildi.`,
            source: "GEMINI_AI_BATCH_SAVE",
          },
        });
      }
    } catch (e) {
      console.error("AI batch log error:", e);
    }

    return NextResponse.json({
      success: true,
      count: savedResults.length,
      savedResults,
    });
  } catch (error: any) {
    console.error("Batch Save Error:", error);
    return NextResponse.json({ error: "Reçeteler kaydedilirken hata oluştu: " + error.message }, { status: 500 });
  }
}
