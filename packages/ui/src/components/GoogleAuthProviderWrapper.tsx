"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function GoogleAuthProviderWrapper({ children }: { children: React.ReactNode }) {
  // Fallback if not provided in .env
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "245037150778-mock-client-id.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
