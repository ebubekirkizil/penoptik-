import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      if (!password) {
        return NextResponse.json({ error: "Şifre zorunludur" }, { status: 400 });
      }

      // Tenant Admin login from specific domains (only password provided)
      const referer = req.headers.get("referer") || "";
      let targetDomain = "";
      
      if (referer.includes("penoptik")) targetDomain = "penoptik.store";
      else if (referer.includes("davutkundura")) targetDomain = "davutkundura.com"; // Assuming davutkundura.com is the domain in DB
      else if (referer.includes("nuh")) targetDomain = "nuh.com";

      if (targetDomain) {
        const firm = await prisma.firm.findFirst({ where: { domain: { contains: targetDomain.replace(".com", "").replace(".store", "") } } });
        if (firm) {
          const tenantUser = await prisma.user.findFirst({ 
            where: { firmId: firm.id, role: "FIRM_ADMIN" },
            include: { firm: true }
          });
          if (tenantUser && tenantUser.password) {
            const isMatch = await bcrypt.compare(password, tenantUser.password);
            if (isMatch) {
              let redirectUrl = "/admin"; 

              await createSession({ userId: tenantUser.id, role: "FIRM_ADMIN", firmId: tenantUser.firmId || undefined });
              const response = NextResponse.json({ success: true, redirectUrl, user: { id: tenantUser.id, name: tenantUser.firstName, firmId: tenantUser.firmId } });
              return response;
            }
          }
        }
      }

      return NextResponse.json({ error: "Geçersiz xifre" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { firm: true }
    });

    const allowedRoles = ["FIRM_ADMIN", "ADMIN", "SUPER_ADMIN"];
    if (!user || !user.password || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Geçersiz e-posta veya xifre" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Geçersiz e-posta veya xifre" }, { status: 401 });
    }

    if (user.isFrozen) {
      return NextResponse.json({ 
        error: "Hesabınız olağandıxı hareketler (Güvenlik İhlali) sebebiyle dondurulmuxtur. Lütfen Mega Admin ile iletixime geçin." 
      }, { status: 403 });
    }

    let redirectUrl = user.role === "SUPER_ADMIN" ? "/super-admin" : "/admin";
    
    await createSession({ userId: user.id, role: user.role, firmId: user.firmId || undefined });
    const response = NextResponse.json({ 
      success: true, 
      redirectUrl, 
      user: { id: user.id, name: user.firstName, firmId: user.firmId } 
    });
    
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Girix baxarısız" }, { status: 500 });
  }
}
