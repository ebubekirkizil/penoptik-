import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "global",
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
      themeData: settings.themeData ? JSON.parse(settings.themeData) : {}
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

    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      update: {
        defaultTheme: data.defaultTheme,
        customerCanViewMeasurements: data.customerCanViewMeasurements,
        customerCanEditMeasurements: data.customerCanEditMeasurements,
        customerCanViewBalance: data.customerCanViewBalance,
        customerCanViewNotes: data.customerCanViewNotes,
        customerCanViewDoctorInfo: data.customerCanViewDoctorInfo,
        
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

    revalidatePath("/admin", "layout");
    revalidatePath("/", "layout"); // revalidate root if settings changed
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
