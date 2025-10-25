"use client";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
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

async function fetchJSON<T = any>(url: string): Promise<T> {
  const r = await axios.get(url);
  return r.data as T;
}

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
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setPage(1);
        setTotal(null);
        if (kind === "crypto") {
          const data: Row[] = await fetchJSON(`/api/crypto?limit=all`);
          if (!cancelled) setRows(data);
        } else if (kind === "forex") {
          const data: Row[] = await fetchJSON(`/api/forex`);
          if (!cancelled) setRows(data);
        } else {
          const resp = await fetchJSON<{ rows: Row[]; page: number; perPage: number; total: number }>(`/api/stocks?page=1&perPage=50`);
          if (!cancelled) {
            setRows(resp.rows);
            setPage(resp.page);
            setTotal(resp.total);
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Gagal memuat data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [kind]);

  const loadMore = async () => {
    if (kind !== "stocks") return;
    if (loading) return;
    const next = page + 1;
    const resp = await fetchJSON<{ rows: Row[]; page: number; perPage: number; total: number }>(`/api/stocks?page=${next}&perPage=50`);
    setRows((r) => ([...(r || []), ...resp.rows]));
    setPage(resp.page);
    setTotal(resp.total);
  };
  const fmt = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString() : "-";
  };
  const fmtPct = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : "0.00";
  };

  const filtered = useMemo(() => (rows || []).filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.symbol.toLowerCase().includes(q) ||
      r.pair.toLowerCase().includes(q)
    );
  }), [rows, query]);

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!rows || loading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
        ))}
      </div>
    );
  }

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
              <td className="px-3 py-3 text-right tabular-nums">{fmt(r.price)}</td>
              <td className="px-3 py-3 text-right">
                <span className={`inline-flex min-w-16 justify-end rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  (Number(r.change24h) || 0) >= 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  {fmtPct(r.change24h)}%
                </span>
              </td>
              <td className="px-3 py-3 text-right tabular-nums">{fmt(r.volume)}</td>
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
