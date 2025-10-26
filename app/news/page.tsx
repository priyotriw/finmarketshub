"use client";
import useSWR from "swr";
import axios from "axios";
import GoogleAds from "@/app/components/GoogleAds";
import SegmentedTabs from "@/app/components/SegmentedTabs";
import { useMemo, useState } from "react";

const fetcher = (url: string) => axios.get(url).then((r) => r.data);

export default function NewsPage() {
  const { data, isLoading, error, mutate } = useSWR(`/api/news`, fetcher, { refreshInterval: 300000 });
  const [cat, setCat] = useState("all");
  const [page, setPage] = useState<number | null>(null);

  const articles = data?.articles || [];
  const filtered = useMemo(() => {
    if (cat === "all") return articles;
    const kw = cat === "crypto" ? ["btc","bitcoin","crypto","blockchain","eth","ethereum"]
      : cat === "forex" ? ["forex","usd","eur","gbp","jpy","aud","cad","chf","nzd","fx"]
      : ["stock","saham","nasdaq","idx","nyse","aapl","msft","nvda","googl","bbri","bbca"];
    return articles.filter((a: any) => {
      const t = `${a.title || ""} ${a.domain || ""} ${a.source || ""}`.toLowerCase();
      return kw.some((k) => t.includes(k));
    });
  }, [articles, cat]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Berita Pasar</h1>
        <SegmentedTabs
          tabs={[
            { key: "all", label: "All" },
            { key: "crypto", label: "Crypto" },
            { key: "forex", label: "Forex" },
            { key: "stocks", label: "Stocks" },
          ]}
          value={cat}
          onChange={setCat}
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-black" />
          ))}
        </div>
      )}
      {error && <div className="text-red-500">Gagal memuat berita.</div>}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-xl border bg-white p-4 text-sm opacity-80 shadow-sm dark:border-zinc-800 dark:bg-black">
          Tidak ada artikel untuk kategori ini atau token belum diisi. Set variabel lingkungan <code>CRYPTOPANIC_TOKEN</code> untuk mengaktifkan feed berita.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((a: any) => (
          <a
            key={a.id || a.url}
            href={a.url}
            target="_blank"
            className="group rounded-xl border bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900/50"
          >
            <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{a.source || a.domain || "Sumber"}</div>
            <div className="mt-1 line-clamp-2 text-lg font-semibold group-hover:underline">{a.title}</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{a.published_at || a.published}</div>
          </a>
        ))}
      </div>

      {data?.nextPage && (
        <div className="mt-4 flex justify-center">
          <button
            className="btn-primary"
            onClick={async () => {
              const next = await fetch(`/api/news?page=${data.nextPage}`).then((r) => r.json());
              const merged = { articles: [...articles, ...(next.articles || [])], nextPage: next.nextPage };
              mutate(merged, { revalidate: false });
            }}
          >
            Load More
          </button>
        </div>
      )}

      <GoogleAds slot="1234567891" />
    </div>
  );
}
