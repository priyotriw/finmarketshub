"use client";
import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type CandlestickData,
  type Time,
  type UTCTimestamp,
  type LineData,
} from "lightweight-charts";

type Candle = { time: number; open: number; high: number; low: number; close: number };

export default function ChartView({ data, ema }: { data: Candle[]; ema?: { time: number; value: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      height: 360,
      layout: { background: { color: "transparent" }, textColor: "#9ca3af" },
      grid: { vertLines: { color: "#1f2937" }, horzLines: { color: "#1f2937" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    }) as IChartApi;
    const candleSeries = (chart as any).addCandlestickSeries();
    const formatted: CandlestickData<Time>[] = data.map((d) => ({
      time: (d.time as unknown as UTCTimestamp),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    candleSeries.setData(formatted);
    if (ema && ema.length) {
      const line = (chart as any).addLineSeries({ color: "#22c55e", lineWidth: 2 });
      const ldata: LineData<Time>[] = ema.map((p) => ({ time: (p.time as unknown as UTCTimestamp), value: p.value }));
      line.setData(ldata);
    }
    const ro = new ResizeObserver(() => chart.applyOptions({ width: ref.current!.clientWidth }));
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [data]);

  return <div ref={ref} className="w-full" />;
}
