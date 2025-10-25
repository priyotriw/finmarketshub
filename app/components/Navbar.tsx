"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FaHome, FaChartLine, FaNewspaper, FaComments, FaInfoCircle, FaBars } from "react-icons/fa";
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
  const [open, setOpen] = useState(false);
  const [hasNewChat, setHasNewChat] = useState(false);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  useEffect(() => {
    if (pathname.startsWith("/chat")) setHasNewChat(false);
  }, [pathname]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("public:messages-nav")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        if (!pathname.startsWith("/chat")) setHasNewChat(true);
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [supabase, pathname]);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/50 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-zinc-800 dark:bg-black/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
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
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <span className="relative text-base">
                  {l.icon}
                  {l.href === "/chat" && hasNewChat && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </span>
                <span>{l.label}</span>
              </Link>
            );
          })}
          <div className="ml-2 pl-2">
            <ThemeToggle />
          </div>
        </nav>
        {/* Mobile actions */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button aria-label="Menu" onClick={() => setOpen((v) => !v)} className="inline-flex items-center justify-center rounded-md border px-2 py-2 text-lg hover:bg-zinc-100 dark:hover:bg-zinc-900">
            <FaBars />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="sm:hidden">
          <nav className="mx-auto max-w-7xl px-4 pb-3">
            <div className="rounded-lg border bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-black">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
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
            </div>
          </nav>
        </div>
      )}

      {/* Bottom mobile nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/90 px-2 py-2 backdrop-blur dark:border-zinc-800 dark:bg-black/60 sm:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`flex flex-col items-center rounded-md px-2 py-1 text-xs ${
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="relative text-lg">
                    {l.icon}
                    {l.href === "/chat" && hasNewChat && (
                      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </span>
                  <span className="mt-0.5">{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
