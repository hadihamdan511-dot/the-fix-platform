import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/getLang";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LangProvider } from "@/components/LangProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Fix",
  description: "Marketing diagnostics and growth insights for your business",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const isArabic = lang === "ar";

  return (
    <html
      lang={lang}
      dir={isArabic ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={isArabic ? { fontFamily: "var(--font-arabic), sans-serif" } : undefined}
      >
        <LangProvider lang={lang}>
          <LanguageSwitcher lang={lang} />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}