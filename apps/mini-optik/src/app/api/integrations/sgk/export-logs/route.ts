import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const firmId = searchParams.get('firmId');
    
    if (!firmId) return new NextResponse("Firm ID eksik", { status: 400 });

    const prescriptions = await prisma.sgkPrescription.findMany({
      where: { firmId },
      include: {
        user: { select: { firstNameHash: true, lastNameHash: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Create CSV content
    let csvContent = "Tarih,Hasta T.C.,E-Recete No,Medula Takip No,Durum,Personel\n";
    
    prescriptions.forEach(rx => {
      const date = rx.createdAt.toISOString().replace('T', ' ').substring(0, 19);
      const user = rx.user ? `${rx.user.firstNameHash} ${rx.user.lastNameHash}` : "Sistem";
      
      csvContent += `${date},${rx.tcKimlik},${rx.eReceteNo},${rx.medulaTakipNo},${rx.status},${user}\n`;
    });

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="sgk_denetim_raporu_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error("SGK export error:", error);
    return new NextResponse("Sunucu hatası", { status: 500 });
  }
}
