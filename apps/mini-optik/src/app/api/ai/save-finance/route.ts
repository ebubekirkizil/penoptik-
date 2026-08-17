import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.firmId) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    const { amount, category, description, type } = await req.json();

    if (!amount || !type) {
      return NextResponse.json({ error: "Eksik bilgi: tutar veya tür" }, { status: 400 });
    }

    const transaction = await prisma.systemFinanceTransaction.create({
      data: {
        firmId: session.firmId,
        type: type === "INCOME" ? "INCOME" : "EXPENSE",
        amount: parseFloat(amount),
        category: category || (type === "INCOME" ? "AI_INCOME" : "AI_EXPENSE"),
        description: description || "AI Asistanı tarafından eklendi",
        status: "COMPLETED",
        date: new Date(),
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error("AI Save Finance Error:", error);
    return NextResponse.json({ error: "Finans işlemi kaydedilirken hata oluştu." }, { status: 500 });
  }
}
