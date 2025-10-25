"use client";
import { useState } from "react";
import MarketTable from "@/app/components/MarketTable";
import GoogleAds from "@/app/components/GoogleAds";
import Hero from "@/app/components/Hero";
import MarketSummary from "@/app/components/MarketSummary";
import SegmentedTabs from "@/app/components/SegmentedTabs";
import { useRouter } from "next/navigation";
import WatchlistPanel from "@/app/components/WatchlistPanel";
import TopMovers from "@/app/components/TopMovers";

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<"crypto" | "forex" | "stocks">("crypto");
  const [query, setQuery] = useState("");
  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <Hero />
      <div className="mb-6">
        <MarketSummary />
      </div>
      <div className="mb-3 mt-2 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <SegmentedTabs
          tabs={[
            { key: "crypto", label: "Crypto Market" },
            { key: "forex", label: "Forex Market" },
            { key: "stocks", label: "Stock Market" },
          ]}
          value={tab}
          onChange={(key) => setTab(key as any)}
        />
        <div className="w-full sm:w-64">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari aset / pair..."
            className="w-full rounded-full border px-4 py-2 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-black"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-black">
            <MarketTable
              kind={tab}
              query={query}
              onRowClick={(row) => router.push(`/analyze?symbol=${encodeURIComponent(row.symbol)}&pair=${encodeURIComponent(row.pair)}`)}
            />
          </div>
        </div>
        <aside className="lg:col-span-1">
          <GoogleAds slot="1796447374" />
          <WatchlistPanel />
          <div className="my-3" />
          <TopMovers />
          <GoogleAds slot="1796447374" />
        </aside>
      </div>
    </div>
  );
}
