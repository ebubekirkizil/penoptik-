import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "fallback-secret-key-for-development";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(user: any) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ ...user, expires });
  
  cookies().set("saas_session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  
  return session;
}

export async function getSession() {
  const session = cookies().get("saas_session")?.value;
  if (!session) return null;
  return await decrypt(session);
}