import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasModule } from "@/lib/permissions";
import { StockMovementType } from "@prisma/client";

interface AdjustStockParams {
  variantId: string;
  warehouseId: string;
  quantity: number; // Pozitif: Giriş, Negatif: Çıkış
  type: StockMovementType;
  unitCost?: number; // Ürün birim maliyeti
  referenceNo?: string; // Fatura no, sipariş no vb.
  notes?: string;
}

export async function adjustStock(params: AdjustStockParams) {
  const session = await getSession();
  if (!session || !session.firmId) {
    throw new Error("Oturum bulunamadı veya yetkisiz erişim.");
  }
  
  const { variantId, warehouseId, quantity, type, unitCost = 0, referenceNo, notes } = params;
  const firmId = session.firmId;

  // 1. Transaction başlat (Hem Stok Defteri hem Depo Stoğu aynı anda güncellensin)
  return await prisma.$transaction(async (tx) => {
    // 1a. Mevcut stok bilgisini çek (Depodaki)
    const currentWarehouseStock = await tx.warehouseStock.findUnique({
      where: {
        FirmId_warehouseId_variantId: {
          FirmId: firmId,
          warehouseId,
          variantId,
        }
      }
    });

    const previousQuantity = currentWarehouseStock ? currentWarehouseStock.quantity : 0;
    const newQuantity = previousQuantity + quantity;

    if (newQuantity < 0) {
      throw new Error(`Yetersiz stok! (Mevcut: ${previousQuantity}, İstenen Çıkış: ${Math.abs(quantity)})`);
    }

    // 1b. WarehouseStock güncelle veya oluştur
    await tx.warehouseStock.upsert({
      where: {
        FirmId_warehouseId_variantId: { FirmId: firmId, warehouseId, variantId }
      },
      update: { quantity: newQuantity },
      create: {
        FirmId: firmId,
        warehouseId,
        variantId,
        quantity: newQuantity,
      }
    });

    // 1c. Toplam varyant stokunu (tüm depolardaki toplamı) hesapla ve güncelle
    const allWarehouseStocks = await tx.warehouseStock.findMany({
      where: { variantId }
    });
    
    // Geçerli transaction içindeki yeni değeri hesaplamak için current olanı çık, yeniyi ekle
    let totalVariantStock = allWarehouseStocks.reduce((acc, stock) => acc + stock.quantity, 0);
    if (!currentWarehouseStock) {
      totalVariantStock += quantity; // Yeni depo stoku ise toplama ekle
    } else {
      totalVariantStock += quantity; // Zaten mevcutsa farkı ekle
    }

    await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: totalVariantStock }
    });

    // 1d. Stok Defterine (Ledger) yaz
    const ledgerEntry = await tx.stockLedger.create({
      data: {
        FirmId: firmId,
        variantId,
        warehouseId,
        movementType: type,
        quantity,
        unitCost,
        reference: referenceNo,
        notes,
        performedBy: session.userId, // İşlemi yapan kullanıcı
      }
    });

    // 2. FİNANS MODÜLÜ ENTEGRASYONU (Lego)
    const hasFinance = await hasModule("finance");
    
    // Eğer mal alımı (PURCHASE) yapılıyorsa ve birim maliyeti (unitCost) girilmişse, finansa GİDER yaz
    if (hasFinance && type === "PURCHASE" && quantity > 0 && unitCost > 0) {
      const totalCost = quantity * unitCost;
      
      await tx.financeTransaction.create({
        data: {
          firmId,
          type: "EXPENSE",
          amount: totalCost,
          category: "INVENTORY_PURCHASE",
          description: `${quantity} adet ürün alımı. (Ref: ${referenceNo || "Belirtilmemiş"})`,
          date: new Date()
        }
      });
    }

    return ledgerEntry;
  });
}
