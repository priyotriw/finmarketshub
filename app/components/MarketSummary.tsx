"use client";
import useSWR from "swr";
import axios from "axios";
import { FaArrowTrendUp, FaArrowTrendDown, FaCoins } from "react-icons/fa6";

const fetcher = (url: string) => axios.get(url).then((r) => r.data);

type Row = { name: string; symbol: string; pair: string; price: number; change24h: number; volume: number };

export default function MarketSummary() {
  const { data: crypto } = useSWR<Row[]>("/api/crypto", fetcher, { refreshInterval: 15000 });
  const { data: forex } = useSWR<Row[]>("/api/forex", fetcher, { refreshInterval: 30000 });
  const { data: stocks } = useSWR<Row[]>("/api/stocks", fetcher, { refreshInterval: 60000 });

  const topGainer = crypto?.slice().sort((a, b) => b.change24h - a.change24h)[0];
  const topLoser = crypto?.slice().sort((a, b) => a.change24h - b.change24h)[0];
  const totalMarkets = (crypto?.length || 0) + (forex?.length || 0) + (stocks?.length || 0);

  const Card = ({ title, value, icon, sub }: { title: string; value: string; icon: React.ReactNode; sub?: string }) => (
    <div className="card rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
          {sub && <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{sub}</div>}
        </div>
        <div className="text-zinc-400">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Card
        title="Top Gainer (24h)"
        value={topGainer ? `${topGainer.name} • ${topGainer.change24h.toFixed(2)}%` : "—"}
        sub={topGainer ? `${topGainer.pair}` : undefined}
        icon={<FaArrowTrendUp className="h-6 w-6 text-green-500" />}
      />
      <Card
        title="Top Loser (24h)"
        value={topLoser ? `${topLoser.name} • ${topLoser.change24h.toFixed(2)}%` : "—"}
        sub={topLoser ? `${topLoser.pair}` : undefined}
        icon={<FaArrowTrendDown className="h-6 w-6 text-red-500" />}
      />
      <Card
        title="Total Instruments"
        value={totalMarkets ? totalMarkets.toLocaleString() : "—"}
        sub="Crypto + Forex + Stocks"
        icon={<FaCoins className="h-6 w-6 text-blue-500" />}
      />
    </div>
  );
}
