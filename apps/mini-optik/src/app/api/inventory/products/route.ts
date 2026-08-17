import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const variants = await prisma.productVariant.findMany({
      where: {
        FirmId: session.firmId,
        isActive: true,
      },
      include: {
        product: true,
        warehouseStocks: true,
      }
    });

    const formattedProducts = variants.map(variant => {
      const totalStock = variant.warehouseStocks.reduce((acc, stock) => acc + stock.quantity, 0);
      let category = "AKSESUAR";
      if (variant.product.category === "OTHER") category = "CERCEVE";

      return {
        id: variant.id,
        category: category,
        name: variant.name || variant.product.name,
        brand: variant.product.vendor || "Generic",
        model: variant.sku || "N/A",
        barcode: variant.barcode || variant.sku || "",
        costPrice: variant.costPrice || variant.product.costPrice || 0,
        salePrice: variant.price || variant.product.price || 0,
        kdv: 20,
        stock: totalStock,
        criticalLimit: 5,
        supplierId: "s1",
        createdAt: variant.product.createdAt.toISOString().split("T")[0],
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, brand, model, barcode, costPrice, salePrice, stock, category, color, size } = body;

    if (!name || !brand) return NextResponse.json({ error: "Name and brand are required" }, { status: 400 });

    // Auto-save brand to settings if it doesn't exist
    try {
      const settings = await prisma.settings.findUnique({ where: { id: "global" } });
      if (settings) {
        let themeDataObj: any = {};
        if (settings.themeData) {
          try { themeDataObj = JSON.parse(settings.themeData); } catch (e) {}
        }
        
        const invSettings = themeDataObj.inventory || {};
        const brands = invSettings.brands || [];
        
        const brandUpper = brand.toUpperCase();
        const existing = brands.find((b: any) => b.name === brandUpper);
        
        if (!existing) {
          const colors = ["blue", "amber", "purple", "teal", "rose", "emerald", "slate"];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          
          brands.push({
            id: Math.random().toString(36).substr(2, 9),
            name: brandUpper,
            color: randomColor
          });
          
          invSettings.brands = brands;
          themeDataObj.inventory = invSettings;
          
          await prisma.settings.update({
            where: { id: "global" },
            data: { themeData: JSON.stringify(themeDataObj) }
          });
        }
      }
    } catch (e) {
      console.error("Auto brand save error:", e);
    }

    // Slugify
    const slug = `${name}-${Date.now()}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Create Product
    const product = await prisma.product.create({
      data: {
        FirmId: session.firmId,
        name: name,
        slug: slug,
        description: name,
        vendor: brand,
        price: salePrice || 0,
        costPrice: costPrice || 0,
        barcode: barcode || null,
        category: "OTHER",
        lowStockAlert: 5,
      }
    });

    // Create ProductVariant
    const variant = await prisma.productVariant.create({
      data: {
        FirmId: session.firmId,
        productId: product.id,
        name: model || name,
        color: color || null,
        size: size || null,
        price: salePrice || 0,
        costPrice: costPrice || 0,
        barcode: barcode || null,
        sku: model || slug,
        stock: stock || 0,
      }
    });

    // Get or create a default warehouse for this firm
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
          isActive: true,
        }
      });
    }

    // Create WarehouseStock entry
    await prisma.warehouseStock.create({
      data: {
        FirmId: session.firmId,
        warehouseId: warehouse.id,
        variantId: variant.id,
        quantity: stock || 0,
        minStock: 5,
      }
    });

    return NextResponse.json({
      id: variant.id,
      category: category || "CERCEVE",
      name: variant.name,
      brand: brand,
      model: variant.sku || "N/A",
      barcode: variant.barcode || "",
      costPrice: variant.costPrice || 0,
      salePrice: variant.price || 0,
      kdv: 20,
      stock: stock || 0,
      criticalLimit: 5,
      supplierId: null,
      createdAt: product.createdAt.toISOString().split("T")[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, name, brand, costPrice, salePrice, stock, color, size } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Update variant
    await prisma.productVariant.update({
      where: { id },
      data: {
        name: name,
        price: salePrice,
        costPrice: costPrice,
        color: color || null,
        size: size || null,
      }
    });

    // Update product vendor (brand)
    const variant = await prisma.productVariant.findUnique({ where: { id }, include: { product: true } });
    if (variant && brand) {
      await prisma.product.update({ where: { id: variant.productId }, data: { vendor: brand } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
