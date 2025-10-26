"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaChartLine, FaNewspaper, FaHeart, FaInfoCircle } from "react-icons/fa";

const links = [
  { href: "/", label: "Home", icon: <FaHome /> },
  { href: "/analyze", label: "Analyze", icon: <FaChartLine /> },
  { href: "/news", label: "News", icon: <FaNewspaper /> },
  { href: "/donasi", label: "Donasi", icon: <FaHeart /> },
  { href: "/about", label: "About", icon: <FaInfoCircle /> },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/90 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur dark:border-zinc-800 dark:bg-black/60 sm:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`flex flex-col items-center rounded-md px-2 py-2 text-xs ${
                  active
                    ? "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <span className="text-lg">{l.icon}</span>
                <span className="mt-0.5">{l.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
