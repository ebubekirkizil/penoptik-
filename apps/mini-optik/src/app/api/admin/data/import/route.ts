import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createBlindIndex } from "@/lib/crypto";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, data } = body;

    if (!type || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Geçersiz veya boş veri" }, { status: 400 });
    }

    let successCount = 0;
    let errorCount = 0;

    if (type === "customers") {
      const newCustomers = [];
      const incomingHashes = new Set();
      
      for (const row of data) {
        const phone = row.phone ? String(row.phone).trim() : `0000${Math.floor(100000 + Math.random() * 900000)}`;
        const phoneHash = createBlindIndex(phone);
        
        if (phoneHash && !incomingHashes.has(phoneHash)) {
          incomingHashes.add(phoneHash);
          newCustomers.push({
            firmId: session.firmId,
            firstName: row.firstName || "İsimsiz",
            lastName: row.lastName || "Müşteri",
            phone: phone,
            phoneHash: phoneHash,
            email: row.email || null,
            address: row.address || null,
            notes: row.notes || null,
            tcNo: row.tcNo ? String(row.tcNo) : null,
          });
        }
      }

      if (newCustomers.length > 0) {
        try {
          const result = await prisma.customer.createMany({
            data: newCustomers,
            skipDuplicates: true,
          });
          successCount = result.count;
          errorCount = data.length - successCount;
        } catch (e) {
          console.error("Bulk create error:", e);
          errorCount = data.length;
        }
      }
    } 
    else if (type === "inventory") {
      // Get or create a default warehouse for this firm
      let warehouse = await prisma.warehouse.findFirst({
        where: { FirmId: session.firmId, isActive: true }
      });
      if (!warehouse) {
        warehouse = await prisma.warehouse.create({
          data: {
            FirmId: session.firmId,
            name: "Ana Depo",
            code: `ANA-${session.firmId.slice(0, 8).toUpperCase()}`,
            isActive: true,
          }
        });
      }

      for (const row of data) {
        try {
          const name = row.name || "İsimsiz Ürün";
          const vendor = row.vendor || "Genel";
          const barcode = row.barcode ? String(row.barcode).trim() : null;
          const sku = row.sku || `${name}-${Date.now()}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          const costPrice = parseFloat(row.costPrice) || 0;
          const price = parseFloat(row.price) || 0;
          const stock = parseInt(row.stock) || 0;
          const category = row.category || "OTHER";

          // If barcode provided, check if exists
          let existingVariant = null;
          if (barcode) {
            existingVariant = await prisma.productVariant.findFirst({
              where: { FirmId: session.firmId, barcode: barcode },
              include: { product: true }
            });
          }

          if (existingVariant) {
            // Update prices
            await prisma.productVariant.update({
              where: { id: existingVariant.id },
              data: { costPrice, price }
            });
            await prisma.product.update({
              where: { id: existingVariant.productId },
              data: { costPrice, price }
            });

            // Update or create warehouse stock
            const ws = await prisma.warehouseStock.findFirst({
              where: { warehouseId: warehouse.id, variantId: existingVariant.id }
            });

            if (ws) {
              await prisma.warehouseStock.update({
                where: { id: ws.id },
                data: { quantity: stock }
              });
            } else {
              await prisma.warehouseStock.create({
                data: { FirmId: session.firmId, warehouseId: warehouse.id, variantId: existingVariant.id, quantity: stock }
              });
            }
            successCount++;
          } else {
            // Create new product
            const slug = `${name}-${Date.now()}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            const product = await prisma.product.create({
              data: {
                FirmId: session.firmId,
                name: name,
                slug: slug,
                description: name,
                vendor: vendor,
                price: price,
                costPrice: costPrice,
                barcode: barcode,
                category: category as any,
              }
            });

            const variant = await prisma.productVariant.create({
              data: {
                FirmId: session.firmId,
                productId: product.id,
                name: name,
                color: row.color || null,
                size: row.size || null,
                price: price,
                costPrice: costPrice,
                barcode: barcode,
                sku: sku,
                stock: stock,
              }
            });

            await prisma.warehouseStock.create({
              data: {
                FirmId: session.firmId,
                warehouseId: warehouse.id,
                variantId: variant.id,
                quantity: stock,
              }
            });
            successCount++;
          }
        } catch (e) {
          console.error(e);
          errorCount++;
        }
      }
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `${successCount} kayıt başarılı, ${errorCount} kayıt atlandı.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
