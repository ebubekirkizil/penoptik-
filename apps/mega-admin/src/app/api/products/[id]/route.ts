import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductCategory, ProductStatus } from "@prisma/client";

// GET: Tek ürün detayı
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { name: "asc" },
        },
        channelVisibility: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Ürün getirme hatası:", error);
    return NextResponse.json(
      { error: "Ürün yüklenirken bir hata oluxtu" },
      { status: 500 }
    );
  }
}

// PATCH: Ürün güncelle
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      slug,
      description,
      shortDesc,
      price,
      compareAtPrice,
      costPrice,
      category,
      vendor,
      sku,
      barcode,
      weight,
      trackInventory,
      lowStockAlert,
      showOnWeb,
      showOnB2B,
      showOnPOS,
      variants = [],
    } = body;

    // Firma ID (production'da session'dan alınacak)
    const firmId = "cm4sqxkce0000k49k4qkxb1vu";

    // Transaction ile güncelleme
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ana ürünü güncelle
      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          description: description || "",
          shortDesc: shortDesc || null,
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          category: category as ProductCategory,
          vendor: vendor || null,
          sku: sku || null,
          barcode: barcode || null,
          weight: weight ? parseFloat(weight) : null,
          lowStockAlert: lowStockAlert ? parseInt(lowStockAlert) : 5,
          trackInventory: trackInventory ?? true,
        },
      });

      // 2. Kanal görünürlüğünü güncelle
      await tx.channelVisibility.update({
        where: { productId: id },
        data: {
          showOnWeb: showOnWeb ?? true,
          showOnB2B: showOnB2B ?? false,
          showOnPOS: showOnPOS ?? false,
        },
      });

      // 3. Varyantları güncelle (basit yaklaxım: sil ve yeniden oluxtur)
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      if (variants && variants.length > 0) {
        for (const variant of variants) {
          const variantName = [
            variant.size,
            variant.color,
            variant.material,
          ]
            .filter(Boolean)
            .join(" - ") || "Standart";

          await tx.productVariant.create({
            data: {
              FirmId: firmId,
              productId: product.id,
              name: variantName,
              size: variant.size || null,
              color: variant.color || null,
              material: variant.material || null,
              sku: variant.sku || null,
              barcode: variant.barcode || null,
              stock: parseInt(variant.stock) || 0,
              price: variant.price ? parseFloat(variant.price) : null,
              isActive: variant.isActive ?? true,
            },
          });
        }
      }

      return product;
    });

    const updatedProduct = await prisma.product.findUnique({
      where: { id: result.id },
      include: {
        variants: true,
        channelVisibility: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Ürün güncelleme hatası:", error);
    return NextResponse.json(
      { error: error.message || "Ürün güncellenirken bir hata oluxtu" },
      { status: 500 }
    );
  }
}

// DELETE: Ürün sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      // İlixkili kayıtları sil
      await tx.channelVisibility.deleteMany({
        where: { productId: id },
      });

      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      // Ürünü sil
      await tx.product.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Ürün silme hatası:", error);
    return NextResponse.json(
      { error: "Ürün silinirken bir hata oluxtu" },
      { status: 500 }
    );
  }
}
