import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.firmId) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    const { type, productName, productCode, quantity, price } = await req.json();

    if (!productName || !quantity) {
      return NextResponse.json({ error: "Eksik bilgi: ürün adı veya miktar" }, { status: 400 });
    }

    // Check if the warehouse exists
    let warehouse = await prisma.warehouse.findFirst({
      where: { FirmId: session.firmId, isActive: true }
    });

    if (!warehouse) {
      const firmCode = session.firmId.slice(0, 8).toUpperCase();
      warehouse = await prisma.warehouse.create({
        data: {
          FirmId: session.firmId,
          name: "Ana Depo",
          code: `ANA-${firmCode}`,
          isActive: true
        }
      });
    }

    // Try to find the product by name or code
    let product = await prisma.product.findFirst({
      where: {
        FirmId: session.firmId,
        OR: [
          { name: { contains: productName, mode: 'insensitive' } },
          productCode ? { slug: productCode } : {}
        ]
      },
      include: { variants: true }
    });

    if (!product) {
      // Create product if it doesn't exist
      product = await prisma.product.create({
        data: {
          FirmId: session.firmId,
          name: productName,
          slug: productCode || productName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: "AI Asistanı tarafından otomatik oluşturuldu",
          price: parseFloat(price) || 0,
          category: "OTHER",
          variants: {
            create: {
              FirmId: session.firmId,
              name: "Standart Varyant",
              stock: parseInt(quantity),
              sku: productCode || undefined,
            }
          }
        },
        include: { variants: true }
      });

      const variantId = product.variants[0].id;
      
      // Stock ledger entry
      await prisma.stockLedger.create({
        data: {
          FirmId: session.firmId,
          variantId: variantId,
          warehouseId: warehouse.id,
          movementType: "PURCHASE",
          quantity: parseInt(quantity),
          reference: "AI_INVENTORY_ADD",
          notes: "AI Asistanı tarafından eklendi"
        }
      });
      
      // Warehouse stock entry
      await prisma.warehouseStock.create({
        data: {
          FirmId: session.firmId,
          warehouseId: warehouse.id,
          variantId: variantId,
          quantity: parseInt(quantity)
        }
      });

    } else {
      // Update existing product
      const variant = product.variants[0]; // pick first variant
      const parsedQty = type === "ADD" ? parseInt(quantity) : parseInt(quantity) - variant.stock;

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          stock: {
            increment: parsedQty
          }
        }
      });

      if (parsedQty !== 0) {
        await prisma.stockLedger.create({
          data: {
            FirmId: session.firmId,
            variantId: variant.id,
            warehouseId: warehouse.id,
            movementType: parsedQty > 0 ? "ADJUSTMENT" : "SALE",
            quantity: Math.abs(parsedQty),
            reference: "AI_INVENTORY_UPDATE",
            notes: "AI Asistanı tarafından stok güncellendi"
          }
        });
        
        // update warehouse stock
        const existingWs = await prisma.warehouseStock.findFirst({
          where: { warehouseId: warehouse.id, variantId: variant.id }
        });
        
        if (existingWs) {
           await prisma.warehouseStock.update({
             where: { id: existingWs.id },
             data: { quantity: { increment: parsedQty } }
           });
        } else {
           await prisma.warehouseStock.create({
             data: {
               FirmId: session.firmId,
               warehouseId: warehouse.id,
               variantId: variant.id,
               quantity: variant.stock + parsedQty
             }
           });
        }
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("AI Save Inventory Error:", error);
    return NextResponse.json({ error: "Stok kaydedilirken hata oluştu." }, { status: 500 });
  }
}
