import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let firm = await prisma.firm.findFirst();
    if (!firm) {
      firm = await prisma.firm.create({
        data: { name: "Yeni Firma" }
      });
    }

    let settings = null;
    if (firm?.id) {
      settings = await prisma.settings.findFirst({ where: { firmId: firm.id } });
    }
    
    const globalSettings = await prisma.settings.findUnique({ where: { id: "global" } });

    if (!settings) {
      settings = globalSettings;
    } else if (globalSettings?.orderStatusConfig && !settings.orderStatusConfig) {
      settings = { ...settings, orderStatusConfig: globalSettings.orderStatusConfig };
    }

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "global",
          firmId: firm.id,
          defaultTheme: "system",
          customerCanViewMeasurements: true,
          customerCanEditMeasurements: false,
          customerCanViewBalance: true,
          customerCanViewNotes: true,
          customerCanViewDoctorInfo: true,
        }
      });
    }

    const parsedSettings = {
      ...settings,
      themeData: settings.themeData ? JSON.parse(settings.themeData) : {},
      firm: {
        id: firm.id,
        name: firm.name,
        email: firm.email || "",
        phone: firm.phone || "",
        address: firm.address || "",
        logoUrl: firm.logoUrl || "",
      }
    };

    return NextResponse.json(parsedSettings);
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    const existingSettings = await prisma.settings.findUnique({
      where: { id: "global" }
    });

    const orderStatusConfigStr = data.orderStatusConfig
      ? (typeof data.orderStatusConfig === 'string' ? data.orderStatusConfig : JSON.stringify(data.orderStatusConfig))
      : undefined;

    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      update: {
        defaultTheme: data.defaultTheme,
        customerCanViewMeasurements: data.customerCanViewMeasurements,
        customerCanEditMeasurements: data.customerCanEditMeasurements,
        customerCanViewBalance: data.customerCanViewBalance,
        customerCanViewNotes: data.customerCanViewNotes,
        customerCanViewDoctorInfo: data.customerCanViewDoctorInfo,
        isAiBotActive: data.isAiBotActive,
        orderStatusConfig: orderStatusConfigStr,
        
        lightPrimary: data.lightPrimary,
        lightSecondary: data.lightSecondary,
        lightBackground: data.lightBackground,
        lightSurface: data.lightSurface,
        lightForeground: data.lightForeground,
        lightMutedForeground: data.lightMutedForeground,
        lightBorder: data.lightBorder,
        
        darkPrimary: data.darkPrimary,
        darkSecondary: data.darkSecondary,
        darkBackground: data.darkBackground,
        darkSurface: data.darkSurface,
        darkForeground: data.darkForeground,
        darkMutedForeground: data.darkMutedForeground,
        darkBorder: data.darkBorder,
        
        themeData: data.themeData ? (typeof data.themeData === 'string' ? data.themeData : JSON.stringify(data.themeData)) : "{}",
      },
      create: {
        id: "global",
        defaultTheme: data.defaultTheme ?? "system",
        customerCanViewMeasurements: data.customerCanViewMeasurements ?? true,
        customerCanEditMeasurements: data.customerCanEditMeasurements ?? false,
        customerCanViewBalance: data.customerCanViewBalance ?? true,
        customerCanViewNotes: data.customerCanViewNotes ?? true,
        customerCanViewDoctorInfo: data.customerCanViewDoctorInfo ?? true,
        orderStatusConfig: orderStatusConfigStr,
        
        lightPrimary: data.lightPrimary,
        lightSecondary: data.lightSecondary,
        lightBackground: data.lightBackground,
        lightSurface: data.lightSurface,
        lightForeground: data.lightForeground,
        lightMutedForeground: data.lightMutedForeground,
        lightBorder: data.lightBorder,
        
        darkPrimary: data.darkPrimary,
        darkSecondary: data.darkSecondary,
        darkBackground: data.darkBackground,
        darkSurface: data.darkSurface,
        darkForeground: data.darkForeground,
        darkMutedForeground: data.darkMutedForeground,
        darkBorder: data.darkBorder,
        
        themeData: data.themeData ? (typeof data.themeData === 'string' ? data.themeData : JSON.stringify(data.themeData)) : "{}",
      }
    });

    // Handle migration of orders if a status was deleted
    if (existingSettings?.orderStatusConfig && orderStatusConfigStr) {
      try {
        const oldList: any[] = JSON.parse(existingSettings.orderStatusConfig);
        const newList: any[] = JSON.parse(orderStatusConfigStr);

        if (Array.isArray(oldList) && Array.isArray(newList) && newList.length > 0) {
          const newIds = new Set(newList.map(s => s.id));
          
          for (let i = 0; i < oldList.length; i++) {
            const oldId = oldList[i].id;
            if (!newIds.has(oldId)) {
              // This status stage was deleted. Find nearest remaining status stage.
              let targetId = newList[0].id;
              if (i < newList.length) {
                targetId = newList[i].id;
              } else if (i > 0 && (i - 1) < newList.length) {
                targetId = newList[i - 1].id;
              } else {
                targetId = newList[newList.length - 1].id;
              }

              // Shift existing orders in the deleted stage to the nearest target stage
              await prisma.opticOrder.updateMany({
                where: { status: oldId, deletedAt: null },
                data: { status: targetId }
              });
            }
          }
        }
      } catch (err) {
        console.error("Order status migration error:", err);
      }
    }

    // Update all settings rows (both global and firm specific) so status config matches everywhere
    await prisma.settings.updateMany({
      data: {
        orderStatusConfig: orderStatusConfigStr,
        defaultTheme: data.defaultTheme,
        customerCanViewMeasurements: data.customerCanViewMeasurements,
        customerCanEditMeasurements: data.customerCanEditMeasurements,
        customerCanViewBalance: data.customerCanViewBalance,
        customerCanViewNotes: data.customerCanViewNotes,
        customerCanViewDoctorInfo: data.customerCanViewDoctorInfo,
      }
    });

    if (data.firm) {
      let firm = await prisma.firm.findFirst();
      if (firm) {
        await prisma.firm.update({
          where: { id: firm.id },
          data: {
            name: data.firm.name,
            email: data.firm.email,
            phone: data.firm.phone,
            address: data.firm.address,
            logoUrl: data.firm.logoUrl,
          }
        });
      }
    }

    revalidatePath("/admin", "layout");
    revalidatePath("/admin/orders", "page");
    revalidatePath("/", "layout");
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
