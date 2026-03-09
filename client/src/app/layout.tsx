import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AgeGate } from "@/components/age-gate";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteSettingsProvider } from "@/components/site-settings-provider";
import { Toaster } from "@/components/ui/sonner";
import dynamic from 'next/dynamic';

const AIAssistant = dynamic(() => import("@/components/ai-assistant").then((mod) => mod.AIAssistant));
import { CookieBanner } from '@/components/cookie-banner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aduket - Premium Adult Streaming",
  description: "High-quality exclusive content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SiteSettingsProvider>
            <AgeGate>
              {children}
              <AIAssistant />
              <Toaster richColors position="top-center" />
              <CookieBanner />
            </AgeGate>
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
