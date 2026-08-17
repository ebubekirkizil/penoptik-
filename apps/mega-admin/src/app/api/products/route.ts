import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductCategory, ProductStatus } from "@prisma/client";

// GET: Tüm ürünleri listele
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (category) {
      where.category = category as ProductCategory;
    }

    if (status) {
      where.status = status as ProductStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
        channelVisibility: true,
        _count: {
          select: {
            variants: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Ürünleri listelerken hata:", error);
    return NextResponse.json(
      { error: "Ürünler yüklenirken bir hata oluxtu" },
      { status: 500 }
    );
  }
}

// POST: Yeni ürün ekle
export async function POST(req: NextRequest) {
  try {
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

    // Validasyon
    if (!name || !slug || !price || !category) {
      return NextResponse.json(
        { error: "Ürün adı, slug, fiyat ve kategori zorunludur" },
        { status: 400 }
      );
    }

    // Firma ID'yi session'dan almalıyız, ximdilik sabit bir değer kullanalım
    // TODO: Auth middleware eklendiğinde burası güncellenecek
    const firmId = "cm4sqxkce0000k49k4qkxb1vu"; // Demo firma ID

    // Slug benzersizlik kontrolü
    const existingProduct = await prisma.product.findUnique({
      where: {
        FirmId_slug: {
          FirmId: firmId,
          slug: slug,
        },
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 409 }
      );
    }

    // SKU benzersizlik kontrolü (eğer varsa)
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: {
          FirmId_sku: {
            FirmId: firmId,
            sku: sku,
          },
        },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: "Bu SKU zaten kullanılıyor" },
          { status: 409 }
        );
      }
    }

    // Transaction ile atomik oluxturma
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ana ürünü oluxtur
      const product = await tx.product.create({
        data: {
          FirmId: firmId,
          name,
          slug,
          description: description || "",
          shortDesc: shortDesc || null,
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          category: category as ProductCategory,
          status: ProductStatus.ACTIVE,
          vendor: vendor || "Davut Kundura Atölyesi",
          sku: sku || null,
          barcode: barcode || null,
          weight: weight ? parseFloat(weight) : null,
          lowStockAlert: lowStockAlert ? parseInt(lowStockAlert) : 5,
          trackInventory: trackInventory ?? true,
          allowBackorder: false,
          tags: [],
          imageUrls: [],
          seoKeywords: [],
        },
      });

      // 2. Kanal görünürlüğünü oluxtur
      await tx.channelVisibility.create({
        data: {
          FirmId: firmId,
          productId: product.id,
          showOnWeb: showOnWeb ?? true,
          showOnB2B: showOnB2B ?? false,
          showOnPOS: showOnPOS ?? false,
        },
      });

      // 3. Varyantları oluxtur (eğer varsa)
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
              costPrice: null,
              imageUrl: null,
              isActive: true,
            },
          });
        }
      }

      return product;
    });

    // Oluxturulan ürünü tüm ilixkileriyle birlikte döndür
    const createdProduct = await prisma.product.findUnique({
      where: { id: result.id },
      include: {
        variants: true,
        channelVisibility: true,
      },
    });

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error: any) {
    console.error("Ürün oluxturma hatası:", error);
    return NextResponse.json(
      { error: error.message || "Ürün oluxturulurken bir hata oluxtu" },
      { status: 500 }
    );
  }
}
