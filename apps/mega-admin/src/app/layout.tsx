import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import GlobalThemeInjector from "@/components/GlobalThemeInjector";
import AutoRefresh from "@/components/AutoRefresh";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mega Admin Panel",
  description: "Admin panel for inventory management",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GlobalThemeInjector />
          {children}
          <AutoRefresh />
        </ThemeProvider>
      </body>
    </html>
  );
}