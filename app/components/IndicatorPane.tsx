"use client";
import { useEffect, useRef } from "react";
import { createChart, type IChartApi, type LineData, type Time, type UTCTimestamp } from "lightweight-charts";

export type SeriesPoint = { time: number; value: number };

export default function IndicatorPane({ title, lines }: { title: string; lines: { color: string; data: SeriesPoint[] }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      height: 140,
      layout: { background: { color: "transparent" }, textColor: "#9ca3af" },
      grid: { vertLines: { color: "#1f2937" }, horzLines: { color: "#1f2937" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    }) as IChartApi;
    for (const l of lines) {
      const s = (chart as any).addLineSeries({ color: l.color, lineWidth: 1.5 });
      const d: LineData<Time>[] = l.data.map((p) => ({ time: (p.time as unknown as UTCTimestamp), value: p.value }));
      s.setData(d);
    }
    const ro = new ResizeObserver(() => chart.applyOptions({ width: ref.current!.clientWidth }));
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart.remove(); };
  }, [JSON.stringify(lines)]);

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-black">
      <div className="mb-2 text-xs uppercase tracking-wide opacity-70">{title}</div>
      <div ref={ref} className="w-full" />
    </div>
  );
}
