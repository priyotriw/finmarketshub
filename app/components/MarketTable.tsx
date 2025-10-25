"use client";
import useSWR from "swr";
import axios from "axios";
import { useWatchlist } from "@/app/components/useWatchlist";
import { FaRegStar, FaStar } from "react-icons/fa";

type Row = {
  name: string;
  symbol: string;
  pair: string;
  price: number;
  change24h: number;
  volume: number;
};

const fetcher = (url: string) => axios.get(url).then((r) => r.data);

export default function MarketTable({
  kind,
  query,
  onRowClick,
}: {
  kind: "crypto" | "forex" | "stocks";
  query?: string;
  onRowClick?: (row: Row) => void;
}) {
  const { has, toggle } = useWatchlist();
  const { data, isLoading, error } = useSWR<Row[]>(`/api/${kind}`, fetcher, {
    refreshInterval: 10_000,
  });

  if (error) return <div className="p-4 text-red-500">Gagal memuat data.</div>;
  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
        ))}
      </div>
    );
  }

  const filtered = (data || []).filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.symbol.toLowerCase().includes(q) ||
      r.pair.toLowerCase().includes(q)
    );
  });

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm dark:border-zinc-800 dark:bg-black">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 backdrop-blur">
          <tr className="border-b border-zinc-200/50 bg-white/70 dark:border-zinc-800 dark:bg-black/40">
            <th className="px-3 py-3 text-left font-medium">Aset</th>
            <th className="px-3 py-3 text-left font-medium">Pair</th>
            <th className="px-3 py-3 text-right font-medium">Harga</th>
            <th className="px-3 py-3 text-right font-medium">24h %</th>
            <th className="px-3 py-3 text-right font-medium">Volume</th>
            <th className="px-3 py-3 text-right font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr
              key={`${r.symbol}-${r.pair}`}
              className="border-b border-zinc-100 last:border-0 transition-colors hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50 cursor-pointer"
              onClick={() => onRowClick?.(r)}
            >
              <td className="px-3 py-3 font-medium">
                <button
          title={has(r.symbol, r.pair) ? "Remove from Watchlist" : "Add to Watchlist"}
          className="mr-2 inline-flex items-center text-amber-500 hover:opacity-80"
          onClick={(e) => { e.stopPropagation(); toggle({ symbol: r.symbol, pair: r.pair, name: r.name, kind }); }}
        >
          {has(r.symbol, r.pair) ? <FaStar /> : <FaRegStar />}
        </button>
                {r.name}
              </td>
              <td className="px-3 py-3">{r.pair}</td>
              <td className="px-3 py-3 text-right tabular-nums">{r.price.toLocaleString()}</td>
              <td className="px-3 py-3 text-right">
                <span className={`inline-flex min-w-16 justify-end rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  r.change24h >= 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  {r.change24h.toFixed(2)}%
                </span>
              </td>
              <td className="px-3 py-3 text-right tabular-nums">{r.volume.toLocaleString()}</td>
              <td className="px-3 py-3 text-right">
                <a
                  className="rounded-md border px-3 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  href={`/analyze?symbol=${encodeURIComponent(r.symbol)}&pair=${encodeURIComponent(r.pair)}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  Lihat Detail
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
