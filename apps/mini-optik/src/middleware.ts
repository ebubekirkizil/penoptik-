import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Super Admin Koruması
  if (pathname.startsWith("/super-admin") && pathname !== "/super-admin/login") {
    const sessionCookie = request.cookies.get("saas_session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/super-admin/login", request.url));
    }

    const payload = await decrypt(sessionCookie);
    
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/super-admin/login", request.url));
    }

    return NextResponse.next();
  }

  // Hayalet Yönetici (Impersonation) Kontrolü
  const impersonateToken = request.nextUrl.searchParams.get("impersonate_token");
  if (impersonateToken) {
    const secretStr = process.env.IMPERSONATE_SECRET;
    if (secretStr) {
      try {
        const secret = new TextEncoder().encode(secretStr);
        const { payload } = await jwtVerify(impersonateToken, secret);

        if (payload.role === "MEGA_ADMIN") {
          // Token geçerli, URL'den token'i temizleyerek admin sayfasına yönlendir
          const newUrl = new URL(pathname, request.url);
          const response = NextResponse.redirect(newUrl);

          // Mega Admin yetkilerini cookie olarak yaz
          response.cookies.set("userRole", "MEGA_ADMIN", { path: "/", maxAge: 60 * 60 * 24 });
          response.cookies.set("userId", "GHOST_ADMIN", { path: "/", maxAge: 60 * 60 * 24 });
          response.cookies.set("admin_token", "true", { path: "/", maxAge: 60 * 60 * 24 });
          
          if (payload.firmId) {
            response.cookies.set("firmId", payload.firmId as string, { path: "/", maxAge: 60 * 60 * 24 });
          }

          return response;
        }
      } catch (error) {
        console.error("Impersonate middleware hatası:", error);
      }
    }
  }

  // 2. Firma Yöneticisi (Admin) Koruması
  if (pathname.startsWith("/admin") && pathname !== "/login") {
    const saasSession = request.cookies.get("saas_session")?.value;
    const oldAdminToken = request.cookies.get("admin_token")?.value;

    if (saasSession) {
      const payload = await decrypt(saasSession);
      if (payload && payload.userId) {
        return NextResponse.next();
      }
    }

    if (oldAdminToken === "true") {
      return NextResponse.next();
    }

    // Redirect to login if both checks fail
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Accept-Language header üzerinden dil tespiti simülasyonu
  const acceptLanguage = request.headers.get("accept-language");
  let preferredLanguage = "tr";

  if (acceptLanguage && acceptLanguage.toLowerCase().includes("en")) {
    preferredLanguage = "en";
  }

  const response = NextResponse.next();
  response.cookies.set("X-Preferred-Language", preferredLanguage, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 gün
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
