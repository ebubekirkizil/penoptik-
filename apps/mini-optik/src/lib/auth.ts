// @ts-nocheck
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

let secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  if (process.env.NODE_ENV === "production") {
    console.warn("WARNING: JWT_SECRET environment variable is missing in production!");
  }
  secretKey = "super-secret-key-for-dev";
}

const encodedKey = new TextEncoder().encode(secretKey);

export type AuthPayload = {
  userId: string;
  role: "SUPER_ADMIN" | "FIRM_ADMIN" | "FIRM_USER";
  firmId?: string; // SUPER_ADMIN doesn't need a firmId initially
};

export async function encrypt(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d") // 30 gün geçerli
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as AuthPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("saas_session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function createSession(payload: AuthPayload) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const session = await encrypt(payload);
  const cookieStore = await cookies();
  
  cookieStore.set("saas_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("saas_session");
}
