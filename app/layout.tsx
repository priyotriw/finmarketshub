import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-alt",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        {/* Theme no-flash: set .dark before paint based on saved preference or OS */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const stored = localStorage.getItem('theme');
              if (!stored) {
                // Persist default dark on first visit
                localStorage.setItem('theme', 'dark');
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.toggle('dark', stored === 'dark');
              }
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
      <body className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable} antialiased`}>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950" />
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 [background:radial-gradient(600px_200px_at_50%_-20%,rgba(59,130,246,.25),transparent)] dark:opacity-60" />
        <Navbar />
        <main className="relative z-0 min-h-[80vh] pb-20 sm:pb-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
