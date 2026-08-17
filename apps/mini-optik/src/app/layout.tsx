// @ts-nocheck
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import GlobalThemeInjector from "@/components/GlobalThemeInjector";
import AutoRefresh from "@/components/AutoRefresh";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getCachedSettings = unstable_cache(
  async () => {
    return await prisma.settings.findUnique({ where: { id: "global" } });
  },
  ['global-settings'],
  { revalidate: 60, tags: ['settings'] }
);

import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  let domain = host.replace("www.", "");
  if (domain.includes(":")) {
    domain = domain.split(":")[0];
  }

  const isSentientWire = domain.includes("sentientwire.com") || domain.includes("localhost");

  if (isSentientWire) {
    return {
      metadataBase: new URL('https://sentientwire.com'),
      title: "Sentient Wire - Yeni Nesil Global ERP Cloud",
      description: "Türkiye'nin en gelişmiş Multi-Tenant B2B/B2C E-Ticaret ve Kurumsal Yönetim Altyapısı. İşinizi global ölçekte yönetmenin gücünü keşfedin.",
      keywords: ["Sentient Wires", "Sentient Wire", "ERP", "B2B E-Ticaret", "Multi-Tenant SaaS", "Kurumsal Yazılım", "Bulut Bilişim", "E-Ticaret Altyapısı"],
      authors: [{ name: "Sentient Wire Team" }],
      openGraph: {
        title: "Sentient Wire - Global ERP Cloud",
        description: "İşinizi sınırların ötesine taşıyacak Yeni Nesil Multi-Tenant B2B/B2C Altyapısı.",
        url: "https://sentientwire.com",
        siteName: "Sentient Wire",
        locale: "tr_TR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Sentient Wire - Global ERP Cloud",
        description: "İşinizi sınırların ötesine taşıyacak Yeni Nesil Multi-Tenant B2B/B2C Altyapısı.",
      },
      icons: {
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='25' fill='%234f46e5'/><text x='50' y='72' font-family='sans-serif' font-size='65' font-weight='900' fill='white' text-anchor='middle'>S</text></svg>"
      }
    };
  }

  // Varsayılan / Firmalar için
  // Not: Gelişmiş versiyonda burada firm veritabanından çekilip adı yazılabilir.
  return {
    title: "Pen Optik - Sipariş Takip Sistemi",
    description: "Modern optisyen sipariş ve müşteri takip sistemi",
    icons: {
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='25' fill='%235c9ca8'/><text x='50' y='72' font-family='sans-serif' font-size='65' font-weight='900' fill='white' text-anchor='middle'>P</text></svg>"
    }
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { CookieConsent } from "@/components/CookieConsent";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings;
  let parsedThemeData = {};
  try {
    settings = await getCachedSettings();
    if (settings?.themeData) {
      try {
        parsedThemeData = JSON.parse(settings.themeData);
      } catch (e) {}
    }
  } catch (error) {
    console.error("Layout settings fetch error:", error);
  }

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {settings && <GlobalThemeInjector themeData={parsedThemeData} />}
      </head>
      <body className={`${inter.className} bg-background text-foreground min-h-screen selection:bg-primary/30 selection:text-amber-600 transition-colors duration-300`}>
        <NextTopLoader color="#fbbf24" showSpinner={false} height={3} shadow="0 0 10px #fbbf24,0 0 5px #fbbf24" />
        <ThemeProvider 
          attribute="class" 
          defaultTheme={settings?.defaultTheme || "system"} 
          enableSystem={!settings?.defaultTheme || settings?.defaultTheme === "system"} 
          disableTransitionOnChange
        >
          <AutoRefresh />
          {children}
          <CookieConsent />
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
