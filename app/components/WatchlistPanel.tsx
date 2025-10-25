"use client";
import { useWatchlist } from "@/app/components/useWatchlist";
import { useRouter } from "next/navigation";
import { FaTimes } from "react-icons/fa";

export default function WatchlistPanel() {
  const { items, remove } = useWatchlist();
  const router = useRouter();
  if (!items.length) {
    return (
      <div className="rounded-xl border bg-white p-3 text-sm opacity-80 shadow-sm dark:border-zinc-800 dark:bg-black">
        Watchlist kosong. Klik ikon bintang pada aset untuk menambah ke watchlist.
      </div>
    );
  }
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-black">
      <div className="mb-2 text-sm font-medium">Watchlist</div>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
        {items.map((it) => (
          <li key={`${it.symbol}-${it.pair}`} className="flex items-center justify-between py-2 text-sm">
            <button
              className="flex-1 truncate text-left hover:underline"
              onClick={() => router.push(`/analyze?symbol=${encodeURIComponent(it.symbol)}&pair=${encodeURIComponent(it.pair)}`)}
              title={`${it.name} (${it.pair})`}
            >
              {it.name} <span className="opacity-60">• {it.pair}</span>
            </button>
            <button
              className="ml-2 inline-flex items-center rounded-md border px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900"
              onClick={() => remove(it.symbol, it.pair)}
              title="Hapus"
            >
              <FaTimes />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
