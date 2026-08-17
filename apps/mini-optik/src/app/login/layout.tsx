// @ts-nocheck
import { prisma } from "@/lib/prisma";
import ThemeInjector from "@/components/ThemeInjector";

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  let settings = null;
  try {
    settings = await prisma.settings.findUnique({ where: { id: "global" } });
  } catch (error) {
    console.error("Layout settings fetch error:", error);
  }

  let loginTheme = null;
  if (settings?.themeData) {
    try {
      const parsed = JSON.parse(settings.themeData);
      loginTheme = parsed.login;
    } catch (e) {}
  }

  return (
    <>
      <ThemeInjector theme={loginTheme} />
      {children}
    </>
  );
}
