import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // 1. Super Admin Koruması
  if (pathname.startsWith("/super-admin")) {
    const sessionCookie = request.cookies.get("saas_session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await decrypt(sessionCookie);
    
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  // 2. Firma Yöneticisi (Admin) Koruması
  if (pathname.startsWith("/admin")) {
    const saasSession = request.cookies.get("saas_session")?.value;
    if (saasSession) {
      const payload = await decrypt(saasSession);
      if (payload && (payload.role === "FIRM_ADMIN" || payload.role === "SUPER_ADMIN" || payload.role === "ADMIN")) {
        return NextResponse.next();
      }
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Multi-Tenant Custom Domain Routing
  

  // Dıxarıda tutulacak (rewrite edilmeyecek) sistem ve global sayfalar:
  const isSystemRoute = 
    pathname.startsWith("/api") || 
    pathname.startsWith("/_next") || 
    pathname.startsWith("/track") ||
    pathname.startsWith("/change-password") ||
    pathname.includes("."); // .ico, .png, vb. dosyalar

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
    "/((?!api|_next/static|_next/image|favicon.ico|ebubekir-kizildas).*)",
  ],
};

