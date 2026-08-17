"use client";

import { GoogleLogin } from "@react-oauth/google";

export function GoogleLoginButton() {
  const handleSuccess = (credentialResponse: any) => {
    if (!credentialResponse?.credential) return;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/google-login";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "credential";
    input.value = credentialResponse.credential;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="flex justify-center w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => alert('Google ile bağlantı kurulamadı.')}
        theme="outline"
        size="large"
        shape="pill"
        width="100%"
        text="signin_with"
      />
    </div>
  );
}
