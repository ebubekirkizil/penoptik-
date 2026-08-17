import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "customers" or "inventory"

    if (type === "customers") {
      const includePrescriptions = searchParams.get("prescriptions") === "true";
      const includeOrders = searchParams.get("orders") === "true";

      const customers = await prisma.customer.findMany({
        where: { firmId: session.firmId, deletedAt: null },
        include: {
           prescriptions: includePrescriptions ? { where: { deletedAt: null } } : false,
           orders: includeOrders ? { where: { deletedAt: null }, include: { items: true, payments: true } } : false,
        }
      });

      const sheets = [];

      // Sheet 1: Müşteriler
      const customerData = customers.map(c => ({
        "Müşteri No": c.id,
        "Ad": c.firstName,
        "Soyad": c.lastName,
        "Telefon": c.phone,
        "E-posta": c.email || "",
        "TC Kimlik": c.tcNo || "",
        "Adres": c.address || "",
        "Notlar": c.notes || "",
        "Kayıt Tarihi": c.createdAt.toISOString().split('T')[0]
      }));
      sheets.push({ sheetName: "Müşteriler", data: customerData });

      // Sheet 2: Reçeteler (if requested)
      if (includePrescriptions) {
        const prescriptionData: any[] = [];
        customers.forEach(c => {
           c.prescriptions?.forEach((p: any) => {
             prescriptionData.push({
               "Müşteri": `${c.firstName} ${c.lastName}`,
               "Telefon": c.phone,
               "Tarih": p.createdAt.toISOString().split('T')[0],
               "Uzak Sağ SPH": p.uzakSagSph || "",
               "Uzak Sol SPH": p.uzakSolSph || "",
               "Yakın Sağ SPH": p.yakinSagSph || "",
               "Yakın Sol SPH": p.yakinSolSph || "",
               "Notlar": p.notes || ""
             });
           });
        });
        sheets.push({ sheetName: "Reçete Kayıtları", data: prescriptionData });
      }

      // Sheet 3: Siparişler (if requested)
      if (includeOrders) {
        const orderData: any[] = [];
        customers.forEach(c => {
           c.orders?.forEach((o: any) => {
             const totalPaid = o.payments?.reduce((sum: number, pay: any) => sum + pay.amount, 0) || 0;
             orderData.push({
               "Müşteri": `${c.firstName} ${c.lastName}`,
               "Sipariş No": o.orderNumber,
               "Tarih": o.createdAt.toISOString().split('T')[0],
               "Durum": o.status,
               "Toplam Tutar": o.totalAmount,
               "Ödenen": totalPaid,
               "Kalan": o.totalAmount - totalPaid
             });
           });
        });
        sheets.push({ sheetName: "Sipariş ve Finans", data: orderData });
      }

      // Return multiple sheets if options selected, else single sheet format for backwards compatibility
      return NextResponse.json(includePrescriptions || includeOrders ? sheets : customerData);
    } 
    
    if (type === "inventory") {
      const variants = await prisma.productVariant.findMany({
        where: { FirmId: session.firmId, isActive: true },
        include: { product: true, warehouseStocks: true }
      });

      const data = variants.map(v => {
        const totalStock = v.warehouseStocks.reduce((sum, ws) => sum + ws.quantity, 0);
        return {
          "Ürün Adı": v.name || v.product.name,
          "Marka": v.product.vendor || "",
          "Barkod": v.barcode || "",
          "Kategori": v.product.category,
          "Alış Fiyatı": v.costPrice || v.product.costPrice || 0,
          "Satış Fiyatı": v.price || v.product.price || 0,
          "Stok Miktarı": totalStock,
          "Renk": v.color || "",
          "Beden/Ekartman": v.size || ""
        };
      });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
