import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinMarkets Hub",
  description: "Portal analisis & pemantauan pasar: Crypto, Forex, Stocks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme no-flash: set .dark before paint based on saved preference or OS */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const stored = localStorage.getItem('theme');
              const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              const useDark = stored ? stored === 'dark' : prefersDark;
              document.documentElement.classList.toggle('dark', useDark);
            } catch {}
          `}
        </Script>
        {/* Google AdSense (only load when client provided) */}
        {adsClient && !adsClient.includes("xxxxxxxx") && (
          <Script
            id="adsense-script"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClient}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950" />
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 [background:radial-gradient(600px_200px_at_50%_-20%,rgba(59,130,246,.25),transparent)] dark:opacity-60" />
        <Navbar />
        <main className="relative z-0 min-h-[80vh]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
