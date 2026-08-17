import { prisma } from "@/lib/prisma";
import ThemeInjector from "@/components/ThemeInjector";

export default async function TrackLayout({ children }: { children: React.ReactNode }) {
  let settings = null;
  try {
    settings = await prisma.settings.findUnique({ where: { id: "global" } });
  } catch (error) {
    console.error("Layout settings fetch error:", error);
  }

  let trackTheme = null;
  if (settings?.themeData) {
    try {
      const parsed = JSON.parse(settings.themeData);
      trackTheme = parsed.customer;
    } catch (e) {}
  }

  return (
    <>
      <ThemeInjector theme={trackTheme} />
      {children}
    </>
  );
}
