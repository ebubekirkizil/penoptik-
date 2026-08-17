import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Girix bilgileri ve xifre zorunludur." }, { status: 400 });
    }

    const idStr = String(identifier);
    const cleanedPhone = idStr.replace(/[\s\-\(\)]+/g, "");

    // --- MOCK CUSTOMER FOR TESTING ---
    if ((idStr === "05555555555" || cleanedPhone === "05555555555") && password === "musteri123") {
      return NextResponse.json({
        success: true,
        customer: {
          id: "mock-customer-123",
          firstName: "Örnek",
          lastName: "Müxteri",
          phone: "05555555555",
        }
      });
    }
    // ---------------------------------

    // --- CHECK IF ADMIN TRYING TO LOGIN FROM CUSTOMER PAGE ---
    const adminUser = await prisma.user.findFirst({
      where: {
        email: idStr,
        role: "FIRM_ADMIN"
      },
      include: { firm: true }
    });

    if (adminUser && adminUser.password) {
      const isMatch = await bcrypt.compare(password, adminUser.password);
      if (isMatch) {
        let redirectUrl = "/admin"; 
        
        const response = NextResponse.json({ 
          success: true, 
          isAdmin: true,
          redirectUrl, 
          user: { id: adminUser.id, name: adminUser.firstName, firmId: adminUser.firmId } 
        });
        
        response.cookies.set("admin_token", "true", { httpOnly: false, secure: false, sameSite: "lax", path: "/", maxAge: 2592000 });
        response.cookies.set("userId", adminUser.id, { httpOnly: false, secure: false, sameSite: "lax", path: "/", maxAge: 2592000 });
        if (adminUser.firmId) {
          response.cookies.set("firmId", adminUser.firmId, { httpOnly: false, secure: false, sameSite: "lax", path: "/", maxAge: 2592000 });
        }
        return response;
      }
    }
    // ---------------------------------------------------------

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: idStr },
          { phone: cleanedPhone },
          { firstName: idStr },
          { lastName: idStr },
          { email: idStr },
        ]
      }
    });

    console.log("Found Customer in API:", customer);

    if (!customer) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    if (!customer.password) {
      return NextResponse.json({ error: "Bu hesaba ait xifre bulunmuyor. Lütfen optisyeninizle iletixime geçin." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Hatalı xifre." }, { status: 401 });
    }

    // Check temp password expiry
    if (customer.isPasswordTemporary) {
      if (customer.tempPasswordExpires && new Date(customer.tempPasswordExpires) < new Date()) {
        return NextResponse.json({ error: "Geçici xifrenizin süresi (7 gün) dolmux. Lütfen optisyeninizle iletixime geçip yeni xifre talep edin." }, { status: 403 });
      }
      return NextResponse.json({
        success: true,
        requiresPasswordChange: true,
        customer: {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
        }
      });
    }

    // Update hasLoggedBefore flag if it's false
    if (!customer.hasLoggedBefore) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { hasLoggedBefore: true }
      });
    }

    // Success
    return NextResponse.json({
      success: true,
      requiresPasswordChange: false,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
      }
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
