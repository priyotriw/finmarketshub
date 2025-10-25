"use client";
import { useEffect, useRef } from "react";

export type SeriesPoint = { time: number; value: number };

export default function IndicatorPane({ title, lines }: { title: string; lines: { color: string; data: SeriesPoint[] }[] }) {
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
        height: 140,
        layout: { background: { color: "transparent" }, textColor: "#9ca3af" },
        grid: { vertLines: { color: "#1f2937" }, horzLines: { color: "#1f2937" } },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false },
      });
      for (const l of lines) {
        const s = (chart as any).addLineSeries({ color: l.color, lineWidth: 1.5 });
        const d = l.data.map((p) => ({ time: (p.time as unknown as number), value: p.value }));
        s.setData(d as any);
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
  }, [JSON.stringify(lines)]);

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-black">
      <div className="mb-2 text-xs uppercase tracking-wide opacity-70">{title}</div>
      <div ref={ref} className="w-full" />
    </div>
  );
}
