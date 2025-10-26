"use client";
import useSWR from "swr";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then((r) => r.data);

type Row = { name: string; symbol: string; pair: string; price: number; change24h: number; volume: number };

export default function TopMovers() {
  const { data, isLoading } = useSWR<Row[]>("/api/crypto", fetcher, { refreshInterval: 15000 });
  const rows = data || [];
  const gainers = rows.slice().sort((a, b) => b.change24h - a.change24h).slice(0, 6);
  const losers = rows.slice().sort((a, b) => a.change24h - b.change24h).slice(0, 6);

  return (
    <div className="card rounded-xl border bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-black">
      <div className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">Top Movers (24h)</div>
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
          ))}
        </div>
      )}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-green-700 dark:text-green-300">Gainers</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {gainers.map((r) => (
                <div key={r.symbol} className="rounded-lg border p-2 text-xs dark:border-zinc-800" style={{ background: "rgba(16,185,129,0.08)" }}>
                  <div className="truncate font-medium text-zinc-800 dark:text-zinc-200">{r.name}</div>
                  <div className="mt-1 tabular-nums text-green-700 dark:text-green-300">{r.change24h.toFixed(2)}%</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-red-700 dark:text-red-300">Losers</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {losers.map((r) => (
                <div key={r.symbol} className="rounded-lg border p-2 text-xs dark:border-zinc-800" style={{ background: "rgba(239,68,68,0.08)" }}>
                  <div className="truncate font-medium text-zinc-800 dark:text-zinc-200">{r.name}</div>
                  <div className="mt-1 tabular-nums text-red-700 dark:text-red-300">{r.change24h.toFixed(2)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
