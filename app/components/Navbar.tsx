"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaChartLine, FaNewspaper, FaComments, FaInfoCircle } from "react-icons/fa";
import ThemeToggle from "@/app/components/ThemeToggle";

const links = [
  { href: "/", label: "Home", icon: <FaHome /> },
  { href: "/analyze", label: "Analyze", icon: <FaChartLine /> },
  { href: "/news", label: "News", icon: <FaNewspaper /> },
  { href: "/chat", label: "Chat", icon: <FaComments /> },
  { href: "/about", label: "About", icon: <FaInfoCircle /> },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/50 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-zinc-800 dark:bg-black/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="inline-block h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-teal-400"></span>
          <span>FinMarkets Hub</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                  active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <span className="text-base">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
          <div className="ml-2 pl-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
