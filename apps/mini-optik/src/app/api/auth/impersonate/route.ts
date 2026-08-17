import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token eksik." }, { status: 400 });
  }

  const secretStr = process.env.IMPERSONATE_SECRET;
  if (!secretStr) {
    return NextResponse.json({ error: "Sunucu konfigürasyon hatası (IMPERSONATE_SECRET bulunamadı)." }, { status: 500 });
  }

  try {
    const secret = new TextEncoder().encode(secretStr);
    
    // Token doğrulama (Süresi dolmuşsa veya geçersizse hata fırlatır)
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "MEGA_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz rol." }, { status: 403 });
    }

    // Doğrulama başarılı, Mega Admin yetkisiyle cookie oluştur
    const cookieStore = await cookies();
    
    // Cookie'lere hayalet admin bilgilerini yaz
    // admin login API'sindeki yapıya uygun olmalı (userRole vb.)
    cookieStore.set("userRole", "MEGA_ADMIN", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 gün geçerli
      path: "/",
    });

    cookieStore.set("userId", "GHOST_ADMIN", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    
    if (payload.firmId) {
      cookieStore.set("firmId", payload.firmId as string, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }

    // Müşteri paneline yönlendir
    return NextResponse.redirect(new URL("/admin", req.url));

  } catch (error) {
    console.error("Impersonate Token Error:", error);
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş token." }, { status: 401 });
  }
}
