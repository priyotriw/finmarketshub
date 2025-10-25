"use client";
import { useEffect, useRef } from "react";
// Use dynamic import to avoid ESM/SSR differences with Turbopack and ensure correct runtime API

type Candle = { time: number; open: number; high: number; low: number; close: number };
type LinePoint = { time: number; value: number };
type BandPoint = { time: number; upper: number; middle: number; lower: number };
type PriceLine = { price: number; color?: string; title?: string };

export default function ChartView({
  data,
  ma10,
  ma20,
  ma50,
  ma200,
  bb,
  priceLines,
  markMode,
  onMarked,
}: {
  data: Candle[];
  ma10?: LinePoint[];
  ma20?: LinePoint[];
  ma50?: LinePoint[];
  ma200?: LinePoint[];
  bb?: BandPoint[];
  priceLines?: PriceLine[];
  markMode?: "entry" | "sl" | "tp" | null;
  onMarked?: (price: number, label: string) => void;
}) {
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
      const api: any = chart as any;
      const candleSeries = typeof api.addCandlestickSeries === "function"
        ? api.addCandlestickSeries()
        : api.addSeries?.({ type: "Candlestick" });
      const formatted = data.map((d) => ({
        time: (d.time as unknown as number),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      // Cast to expected UTCTimestamp type at runtime is unnecessary; library accepts number epoch seconds
      candleSeries.setData(formatted as any);
      const addLine = (points?: LinePoint[], color = "#22c55e") => {
        if (!points || !points.length) return;
        const api2: any = chart as any;
        const line = typeof api2.addLineSeries === "function"
          ? api2.addLineSeries({ color, lineWidth: 2 })
          : api2.addSeries?.({ type: "Line", color, lineWidth: 2 });
        const ldata = points.map((p) => ({ time: (p.time as unknown as number), value: p.value }));
        line?.setData?.(ldata as any);
      };

      addLine(ma10, "#f59e0b");
      addLine(ma20, "#22c55e");
      addLine(ma50, "#3b82f6");
      addLine(ma200, "#ef4444");

      if (bb && bb.length) {
        const upper = bb.map((p) => ({ time: p.time as any, value: p.upper }));
        const middle = bb.map((p) => ({ time: p.time as any, value: p.middle }));
        const lower = bb.map((p) => ({ time: p.time as any, value: p.lower }));
        addLine(middle as any, "#a3a3a3");
        addLine(upper as any, "#9ca3af");
        addLine(lower as any, "#9ca3af");
      }

      // Horizontal price lines (Pivot / SR / Fibo)
      const lines: any[] = [];
      if (Array.isArray(priceLines)) {
        for (const pl of priceLines) {
          try {
            const created = candleSeries.createPriceLine?.({
              price: pl.price,
              color: pl.color || "#a1a1aa",
              lineWidth: 1,
              lineStyle: 2,
              axisLabelVisible: true,
              title: pl.title || "",
            });
            if (created) lines.push(created);
          } catch {}
        }
      }
      // Click to mark Entry/SL/TP line
      try {
        // @ts-ignore
        chart.subscribeClick?.((param: any) => {
          if (!markMode || !param || typeof param?.point?.x === "undefined") return;
          const price = param?.seriesPrices?.get?.(candleSeries) ?? param?.price ?? null;
          if (price == null) return;
          const label = markMode.toUpperCase();
          onMarked?.(Number(price), label);
        });
      } catch {}

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
  }, [data, ma10, ma20, ma50, ma200, bb, priceLines, markMode, onMarked]);

  return <div ref={ref} className="w-full" />;
}
