"use client";
import { useEffect, useRef } from "react";
// Use dynamic import to avoid ESM/SSR differences with Turbopack and ensure correct runtime API

type Candle = { time: number; open: number; high: number; low: number; close: number };

export default function ChartView({ data, ema }: { data: Candle[]; ema?: { time: number; value: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let mounted = true;
    const el = ref.current;
    let chart: any = null;
    let ro: ResizeObserver | null = null;
    (async () => {
      const mod = await import("lightweight-charts");
      if (!mounted || !el) return;
      chart = mod.createChart(el, {
        height: 360,
        layout: { background: { color: "transparent" }, textColor: "#9ca3af" },
        grid: { vertLines: { color: "#1f2937" }, horzLines: { color: "#1f2937" } },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false },
      });
      if (!mounted) return;
      const candleSeries = (chart as any).addCandlestickSeries();
      const formatted = data.map((d) => ({
        time: (d.time as unknown as number),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      // Cast to expected UTCTimestamp type at runtime is unnecessary; library accepts number epoch seconds
      candleSeries.setData(formatted as any);
      if (ema && ema.length) {
        const line = (chart as any).addLineSeries({ color: "#22c55e", lineWidth: 2 });
        const ldata = ema.map((p) => ({ time: (p.time as unknown as number), value: p.value }));
        line.setData(ldata as any);
      }
      ro = new ResizeObserver(() => {
        if (!el || !chart) return;
        chart.applyOptions({ width: el.clientWidth });
      });
      ro.observe(el);
    })();
    return () => {
      mounted = false;
      if (ro) ro.disconnect();
      if (chart) chart.remove();
    };
  }, [data, ema]);

  return <div ref={ref} className="w-full" />;
}
