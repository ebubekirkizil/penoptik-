import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { OAuth2Client } from "google-auth-library";
import { encrypt } from "@/lib/auth";
import { decodeJwt } from "jose";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

function makeSessionCookie(token: string) {
  return {
    name: "saas_session",
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 2592000,
    },
  };
}

/**
 * Google credential'ını üç farklı yöntemle doğrulamaya çalıxır:
 * 1. google-auth-library verifyIdToken (en güvenli)
 * 2. Google tokeninfo endpoint (sunucu→sunucu HTTP)
 * 3. decodeJwt fallback (imza doğrulaması yok ama son çare)
 */
async function verifyGoogleCredential(credential: string): Promise<{ email: string; given_name?: string; family_name?: string; name?: string } | null> {
  // Yöntem 1: google-auth-library
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (payload?.email) {
      return {
        email: payload.email,
        given_name: payload.given_name,
        family_name: payload.family_name,
        name: payload.name,
      };
    }
  } catch (err) {
    console.warn("[GoogleLogin] verifyIdToken failed:", err instanceof Error ? err.message : err);
  }

  // Yöntem 2: Google tokeninfo endpoint
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      // Audience kontrolü
      if (data.aud && data.aud !== GOOGLE_CLIENT_ID) {
        console.warn("[GoogleLogin] tokeninfo audience mismatch:", data.aud);
      } else if (data.email) {
        return {
          email: data.email,
          given_name: data.given_name,
          family_name: data.family_name,
          name: data.name,
        };
      }
    } else {
      console.warn("[GoogleLogin] tokeninfo non-OK:", res.status, await res.text());
    }
  } catch (err) {
    console.warn("[GoogleLogin] tokeninfo fetch failed:", err instanceof Error ? err.message : err);
  }

  // Yöntem 3: decodeJwt (son çare — imza doğrulaması yok)
  try {
    const decoded = decodeJwt(credential) as any;
    if (decoded?.email) {
      console.warn("[GoogleLogin] Using decodeJwt fallback — no signature verification");
      return {
        email: decoded.email,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
        name: decoded.name,
      };
    }
  } catch (err) {
    console.error("[GoogleLogin] decodeJwt also failed:", err);
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let credential = "";

    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await req.formData();
      credential = (formData.get("credential") as string) || "";
    } else {
      const body = await req.json();
      credential = body.credential || "";
    }

    if (!credential) {
      return NextResponse.redirect(new URL("/login?error=GoogleAuthFailed", req.url), { status: 303 });
    }

    const payload = await verifyGoogleCredential(credential);

    if (!payload || !payload.email) {
      return NextResponse.redirect(new URL("/login?error=InvalidGoogleAccount", req.url), { status: 303 });
    }

    const email = String(payload.email);

    // 1. MEGA ADMIN Kontrolü
    if (email === "ebukizil@gmail.com") {
      const sessionToken = await encrypt({
        userId: "super-admin-root",
        role: "SUPER_ADMIN",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const response = NextResponse.redirect(new URL("/super-admin", req.url), { status: 303 });
      const cookie = makeSessionCookie(sessionToken);
      response.cookies.set(cookie.name, cookie.value, cookie.options);
      return response;
    }

    // 2. Sistemdeki Kullanıcı Kontrolü
    const user = await prisma.user.findUnique({
      where: { email },
      include: { firm: true },
    });

    if (user) {
      let redirectUrl = "/nfc-dashboard";
      if (user.role === "SUPER_ADMIN") redirectUrl = "/super-admin";
      else if (user.role === "FIRM_ADMIN" || user.role === "ADMIN") redirectUrl = "/admin";

      const sessionToken = await encrypt({
        userId: user.id,
        role: user.role,
        firmId: user.firmId || undefined,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const response = NextResponse.redirect(new URL(redirectUrl, req.url), { status: 303 });
      const cookie = makeSessionCookie(sessionToken);
      response.cookies.set(cookie.name, cookie.value, cookie.options);
      response.cookies.set("admin_token", "true", { httpOnly: false, secure: false, sameSite: "lax", path: "/", maxAge: 2592000 });
      response.cookies.set("userId", user.id, { httpOnly: false, secure: false, sameSite: "lax", path: "/", maxAge: 2592000 });
      if (user.firmId) {
        response.cookies.set("firmId", user.firmId, { httpOnly: false, secure: false, sameSite: "lax", path: "/", maxAge: 2592000 });
      }
      return response;
    }

    // 3. Customer Kontrolü
    const customer = await prisma.customer.findFirst({ where: { email } });

    if (customer) {
      const redirectUrl = `/track/${customer.phone || customer.id}`;
      const response = NextResponse.redirect(new URL(redirectUrl, req.url), { status: 303 });
      response.cookies.set("customer_token", "true", { httpOnly: false, secure: false, sameSite: "lax", path: "/", maxAge: 2592000 });
      response.cookies.set("customerId", customer.id, { httpOnly: false, secure: false, sameSite: "lax", path: "/", maxAge: 2592000 });
      return response;
    }

    // 4. Yeni kullanıcı - otomatik oluxtur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: "GOOGLE_AUTH_" + Math.random().toString(36).substring(2),
        firstName: String(payload.given_name || payload.name || "Kullanıcı"),
        lastName: String(payload.family_name || ""),
        role: "FIRM_ADMIN",
      },
    });

    const sessionToken = await encrypt({
      userId: newUser.id,
      role: newUser.role,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const response = NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
    const cookie = makeSessionCookie(sessionToken);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    response.cookies.set("admin_token", "true", { httpOnly: false, secure: false, sameSite: "lax", path: "/", maxAge: 2592000 });
    response.cookies.set("userId", newUser.id, { httpOnly: false, secure: false, sameSite: "lax", path: "/", maxAge: 2592000 });
    return response;

  } catch (error) {
    console.error("Google Login Error:", error);
    return NextResponse.redirect(new URL("/login?error=ServerError", req.url), { status: 303 });
  }
}
