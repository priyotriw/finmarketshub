"use client";
import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChartView from "@/app/components/ChartView";
import GoogleAds from "@/app/components/GoogleAds";
import IndicatorToolbar, { type Indicators } from "@/app/components/IndicatorToolbar";
import IndicatorPane, { type SeriesPoint } from "@/app/components/IndicatorPane";

function emaSeries(closes: number[], period = 20) {
  if (closes.length < period) return [] as number[];
  const k = 2 / (period + 1);
  const out: number[] = [];
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out.push(ema);
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
    out.push(ema);
  }
  return out;
}

function rsiSeries(closes: number[], period = 14): number[] {
  if (closes.length < period + 1) return [];
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const ch = closes[i] - closes[i - 1];
    if (ch >= 0) gains += ch; else losses -= ch;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  const out: number[] = [];
  for (let i = period + 1; i < closes.length; i++) {
    const ch = closes[i] - closes[i - 1];
    const gain = Math.max(0, ch);
    const loss = Math.max(0, -ch);
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / (avgLoss || 1e-9);
    const rsi = 100 - 100 / (1 + rs);
    out.push(rsi);
  }
  return out;
}

function macdLines(closes: number[]): { macd: number[]; signal: number[] } {
  const ema12 = emaSeries(closes, 12);
  const ema26 = emaSeries(closes, 26);
  const len = Math.min(ema12.length, ema26.length);
  if (len === 0) return { macd: [], signal: [] };
  const macd: number[] = [];
  for (let i = 0; i < len; i++) macd.push(ema12[i + (ema12.length - len)] - ema26[i + (ema26.length - len)]);
  const signal = emaSeries(macd, 9);
  return { macd, signal };
}

function computeSignals(data: { close: number }[]) {
  if (data.length < 26) return { signal: "Neutral", reasons: ["Data minimal"] };
  const closes = data.map((d) => d.close);
  const last = closes[closes.length - 1];
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  // MACD sederhana (12-26 EMA)
  const ema12 = emaSeries(closes, 12);
  const ema26 = emaSeries(closes, 26);
  const last12 = ema12.length ? ema12[ema12.length - 1] : 0;
  const last26 = ema26.length ? ema26[ema26.length - 1] : 0;
  const macd = last12 - last26;
  const change = ((last - sma20) / sma20) * 100;
  let signal: "Buy" | "Sell" | "Neutral" = "Neutral";
  if (change > 0.5 && macd > 0) signal = "Buy";
  else if (change < -0.5 && macd < 0) signal = "Sell";
  return {
    signal,
    reasons: [
      `Harga vs SMA20: ${change.toFixed(2)}%`,
      `MACD: ${macd.toFixed(2)}`,
    ],
  };
}

export const dynamic = "force-dynamic";

function AnalyzeInner() {
  const search = useSearchParams();
  const symbol = search.get("symbol") || "BTC";
  const pair = search.get("pair") || "BTC/USDT";
  const [data, setData] = useState<{ time: number; open: number; high: number; low: number; close: number }[]>([]);
  const [tf, setTf] = useState("1h");
  const [ind, setInd] = useState<Indicators>({ ema: true, rsi: false, macd: true });

  useEffect(() => {
    // placeholder: generate synthetic data; integrate with real symbol/timeframe later
    const now = Math.floor(Date.now() / 1000);
    const interval = tf === "1m" ? 60 : tf === "5m" ? 300 : tf === "1h" ? 3600 : 86400;
    // seed ringan berdasarkan symbol agar pola tidak selalu sama untuk simbol berbeda
    const seed = Array.from(symbol).reduce((a, c) => a + c.charCodeAt(0), 0) % 97;
    const candles = Array.from({ length: 300 }).map((_, i) => {
      const t = now - (300 - i) * interval;
      const rnd = Math.sin((i + seed) / 9) * 0.8 + Math.cos((i + seed) / 17) * 0.6;
      const base = 100 + Math.sin(i / 10) * 2 + rnd * 0.5;
      const o = base + (Math.random() - 0.5);
      const c = base + (Math.random() - 0.5);
      const h = Math.max(o, c) + Math.random();
      const l = Math.min(o, c) - Math.random();
      return { time: t, open: o, high: h, low: l, close: c };
    });
    setData(candles);
  }, [tf, symbol]);

  const analysis = useMemo(() => computeSignals(data), [data]);
  const ema20: { time: number; value: number }[] = useMemo(() => {
    const closes = data.map((d) => d.close);
    const arr: number[] = emaSeries(closes, 20);
    const offset = data.length - arr.length;
    const out: { time: number; value: number }[] = [];
    for (let i = 0; i < arr.length; i++) {
      const idx = i + offset;
      if (idx >= 0 && idx < data.length) {
        out.push({ time: data[idx].time, value: Number(arr[i]) });
      }
    }
    return out;
  }, [data]);

  const rsi: SeriesPoint[] = useMemo(() => {
    const closes = data.map((d) => d.close);
    const arr = rsiSeries(closes, 14);
    const offset = data.length - arr.length;
    const out: SeriesPoint[] = [];
    for (let i = 0; i < arr.length; i++) {
      const idx = i + offset;
      if (idx >= 0 && idx < data.length) out.push({ time: data[idx].time, value: Number(arr[i]) });
    }
    return out;
  }, [data]);

  const macdPts: { macd: SeriesPoint[]; signal: SeriesPoint[] } = useMemo(() => {
    const closes = data.map((d) => d.close);
    const { macd, signal } = macdLines(closes);
    const offM = data.length - macd.length;
    const offS = data.length - signal.length;
    return {
      macd: macd.map((v, i) => ({ time: data[i + offM].time, value: Number(v) })),
      signal: signal.map((v, i) => ({ time: data[i + offS].time, value: Number(v) })),
    };
  }, [data]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analyze: {symbol}</h1>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Pair: {pair}</div>
        </div>
        <div className="text-xs opacity-80">Timeframe: <span className="rounded-full border px-2 py-0.5">{tf}</span></div>
      </div>
      <div className="mb-3">
        <IndicatorToolbar timeframe={tf} onTimeframe={setTf} indicators={ind} onIndicators={setInd} />
      </div>
      <div className="rounded-xl border bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-black">
        <ChartView data={data} ema={ind.ema ? ema20 : undefined} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
          <p className="text-sm opacity-70">Analisa Otomatis</p>
          <div className="mt-1 text-lg font-semibold">Sinyal: {analysis.signal}</div>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {analysis.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-white p-4 text-sm opacity-80 shadow-sm dark:border-zinc-800 dark:bg-black">
          Catatan: Indikator RSI/MACD/EMA adalah sederhana untuk demo. Integrasi indikator penuh dapat dilakukan dengan perhitungan teknikal yang lebih lengkap.
        </div>
      </div>

      {(ind.rsi || ind.macd) && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          {ind.rsi && <IndicatorPane title="RSI (14)" lines={[{ color: "#3b82f6", data: rsi }]} />}
          {ind.macd && <IndicatorPane title="MACD (12,26,9)" lines={[{ color: "#ef4444", data: macdPts.macd }, { color: "#22c55e", data: macdPts.signal }]} />}
        </div>
      )}
      <GoogleAds slot="1796447374" />
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-6">Memuat Analyze…</div>}>
      <AnalyzeInner />
    </Suspense>
  );
}
