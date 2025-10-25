"use client";
import { useEffect, useRef } from "react";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load TV script"));
    document.head.appendChild(s);
  });
}

function mapTimeframe(tf: string): string {
  if (tf === "1m") return "1";
  if (tf === "5m") return "5";
  if (tf === "1h") return "60";
  return "D";
}

export default function TradingView({ symbol, pair, timeframe }: { symbol: string; pair: string; timeframe: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mounted = true;
    const el = ref.current;
    if (!el) return;
    (async () => {
      try {
        await loadScript("https://s3.tradingview.com/tv.js");
        if (!mounted || !el) return;
        // Infer TV symbol
        let tvSymbol = symbol;
        const compactPair = pair.replace("/", "");
        if (pair.toUpperCase().includes("/USDT")) tvSymbol = `BINANCE:${compactPair}`;
        else if (pair.includes("/")) tvSymbol = `FX_IDC:${compactPair}`;
        // Leave stocks as-is (user can adjust if needed)
        const interval = mapTimeframe(timeframe);
        // @ts-ignore
        if (window.TradingView) {
          // Clear previous
          el.innerHTML = "";
          // @ts-ignore
          new window.TradingView.widget({
            container_id: el.id,
            symbol: tvSymbol,
            interval,
            theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
            style: "1",
            locale: "en",
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            autosize: true,
          });
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [symbol, pair, timeframe]);

  // Unique id per mount
  const id = "tv_widget_" + Math.random().toString(36).slice(2);
  return <div id={id} ref={ref} className="h-[480px] w-full" />;
}
