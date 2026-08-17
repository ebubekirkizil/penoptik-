import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL("/", url.origin);
  
  const response = NextResponse.redirect(redirectUrl);
  
  // Clear all authentication cookies
  response.cookies.delete("saas_session");
  response.cookies.delete("admin_token");
  response.cookies.delete("userId");
  response.cookies.delete("userRole");
  response.cookies.delete("firmId");
  response.cookies.delete("customer_token");
  
  return response;
}
