"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHome, FaChartLine, FaNewspaper, FaInfoCircle, FaHeart } from "react-icons/fa";

const links = [
  { href: "/", label: "Home", icon: <FaHome /> },
  { href: "/analyze", label: "Analyze", icon: <FaChartLine /> },
  { href: "/news", label: "News", icon: <FaNewspaper /> },
  { href: "/donasi", label: "Donasi", icon: <FaHeart /> },
  { href: "/about", label: "About", icon: <FaInfoCircle /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/50 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-zinc-800 dark:bg-black/40">
      <div className="mx-auto hidden max-w-7xl items-center justify-between px-4 py-3 sm:flex">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="inline-block h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-teal-400"></span>
          <span>FinMarkets Hub</span>
        </Link>
        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                  active
                    ? "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                    : "text-zinc-600 hover:bg-yellow-500/20 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-yellow-500/20 dark:hover:text-zinc-100"
                }`}
              >
                <span className="relative text-base">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
          
        </nav>
        {/* Mobile actions hidden (we use bottom nav only) */}
        <div className="hidden" />
      </div>

      {/* Mobile dropdown menu disabled */}

      {/* Bottom mobile nav moved to MobileNav component rendered from layout */}
    </header>
  );
}
