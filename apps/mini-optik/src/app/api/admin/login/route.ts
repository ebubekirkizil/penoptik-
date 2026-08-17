import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = body.email || body.phone || body.identifier;
    const password = body.password;
    
    if (!password) {
      return NextResponse.json({ error: "Şifre zorunludur" }, { status: 400 });
    }



    // Tenant Admin login from specific domains (only password provided)
    if (!identifier) {
      const referer = req.headers.get("referer") || "";
      let targetDomain = "";
      
      if (referer.includes("penoptik")) targetDomain = "penoptik.store";
      else if (referer.includes("davutkundura")) targetDomain = "davutkundura.com"; 
      else if (referer.includes("nuh")) targetDomain = "nuh.com";

      if (targetDomain) {
        const firm = await prisma.firm.findFirst({ where: { domain: { contains: targetDomain.replace(".com", "").replace(".store", "") } } });
        if (firm) {
          const tenantUser = await prisma.user.findFirst({ 
            where: { firmId: firm.id, role: "FIRM_ADMIN", deletedAt: null },
            include: { firm: true }
          });
          if (tenantUser && tenantUser.password) {
            const isMatch = await bcrypt.compare(password, tenantUser.password);
            if (isMatch) {
              let redirectUrl = "/admin"; 
              const response = NextResponse.json({ success: true, redirectUrl, user: { id: tenantUser.id, name: tenantUser.firstName, firmId: tenantUser.firmId } });
              response.cookies.set("admin_token", "true", { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 2592000 });
              response.cookies.set("userId", tenantUser.id, { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 2592000 });
              if (tenantUser.firmId) response.cookies.set("firmId", tenantUser.firmId, { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 2592000 });
              return response;
            }
          }
        }
      }
      return NextResponse.json({ error: "Geçersiz şifre" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: identifier },
          { username: identifier },
          { userCode: identifier }
        ],
        deletedAt: null
      },
      include: { firm: true }
    });

    // If user not found, let's also try to find by customer phone if we eventually support customer login here
    // But this is admin login, so admins usually use email, username or userCode.

    if (!user || !user.password) {
      return NextResponse.json({ error: "Geçersiz e-posta veya şifre" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Geçersiz e-posta veya şifre" }, { status: 401 });
    }

    let redirectUrl = "/admin"; 
    
    const response = NextResponse.json({ 
      success: true, 
      redirectUrl, 
      user: { id: user.id, name: user.firstName, firmId: user.firmId } 
    });
    
    // Set saas_session for API routes that use getSession()
    const session = await encrypt({
      userId: user.id,
      role: user.role as any || "FIRM_ADMIN",
      firmId: user.firmId || undefined
    });
    response.cookies.set("saas_session", session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 2592000 });
    
    response.cookies.set("admin_token", "true", { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 2592000 });
    response.cookies.set("userId", user.id, { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 2592000 });
    response.cookies.set("userRole", user.role || "PERSONEL_2", { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 2592000 });
    if (user.firmId) {
      response.cookies.set("firmId", user.firmId, { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 2592000 });
    }

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Giriş başarısız" }, { status: 500 });
  }
}
