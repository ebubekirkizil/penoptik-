import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const firmId = searchParams.get('firmId');
    
    if (!firmId) return new NextResponse("Firm ID eksik", { status: 400 });

    const logs = await prisma.utsLog.findMany({
      where: { firmId },
      include: {
        user: { select: { firstNameHash: true, lastNameHash: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Create CSV content
    let csvContent = "Tarih,Islem Tipi,Durum,Barkod/GTIN,Personel,Detay\n";
    
    logs.forEach(log => {
      const date = log.createdAt.toISOString().replace('T', ' ').substring(0, 19);
      const user = log.user ? `${log.user.firstNameHash} ${log.user.lastNameHash}` : "Sistem";
      // Escape commas in details
      const details = log.details ? `"${log.details.replace(/"/g, '""')}"` : "";
      
      csvContent += `${date},${log.actionType},${log.status},${log.barcode},${user},${details}\n`;
    });

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="uts_denetim_raporu_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error("UTS export error:", error);
    return new NextResponse("Sunucu hatası", { status: 500 });
  }
}
