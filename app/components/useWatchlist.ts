"use client";
import { useEffect, useState } from "react";

export type WatchItem = {
  symbol: string;
  pair: string;
  name: string;
  kind: "crypto" | "forex" | "stocks";
};

const KEY = "watchlist";

export function useWatchlist() {
  const [items, setItems] = useState<WatchItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: WatchItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const add = (it: WatchItem) => {
    if (items.find((x) => x.symbol === it.symbol && x.pair === it.pair)) return;
    persist([it, ...items].slice(0, 100));
  };
  const remove = (symbol: string, pair: string) => {
    persist(items.filter((x) => !(x.symbol === symbol && x.pair === pair)));
  };
  const toggle = (it: WatchItem) => {
    const exists = items.find((x) => x.symbol === it.symbol && x.pair === it.pair);
    if (exists) remove(it.symbol, it.pair);
    else add(it);
  };
  const has = (symbol: string, pair: string) => !!items.find((x) => x.symbol === symbol && x.pair === pair);

  return { items, add, remove, toggle, has };
}
