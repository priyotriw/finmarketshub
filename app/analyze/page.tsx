"use client";
import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChartView from "@/app/components/ChartView";
import GoogleAds from "@/app/components/GoogleAds";
import IndicatorToolbar, { type Indicators } from "@/app/components/IndicatorToolbar";
import IndicatorPane, { type SeriesPoint } from "@/app/components/IndicatorPane";
import TradingView from "@/app/components/TradingView";
import SegmentedTabs from "@/app/components/SegmentedTabs";

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

function smaSeries(closes: number[], period: number) {
  if (closes.length < period) return [] as number[];
  const out: number[] = [];
  let sum = closes.slice(0, period).reduce((a, b) => a + b, 0);
  out.push(sum / period);
  for (let i = period; i < closes.length; i++) {
    sum += closes[i] - closes[i - period];
    out.push(sum / period);
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

const THRESHOLDS = {
  rsiOverbought: 70,
  rsiOversold: 30,
  macdStrongBias: 0.5, // absolute MACD - signal
  devTrendPct: 0.5, // % di atas/bawah MA20 untuk bias
};

function computePivots(candles: { high: number; low: number; close: number }[]) {
  if (!candles.length) return null as any;
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const H = Math.max(...highs);
  const L = Math.min(...lows);
  const C = candles[candles.length - 1].close;
  const P = (H + L + C) / 3;
  const R1 = 2 * P - L;
  const S1 = 2 * P - H;
  const R2 = P + (H - L);
  const S2 = P - (H - L);
  const R3 = H + 2 * (P - L);
  const S3 = L - 2 * (H - P);
  return { P, R1, R2, R3, S1, S2, S3 };
}

function computeSR(candles: { time: number; high: number; low: number }[], lastClose: number | undefined) {
  const n = candles.length;
  if (n < 20) return { supports: [], resistances: [] };
  const window = 5;
  const peaks: number[] = [];
  const troughs: number[] = [];
  for (let i = window; i < n - window; i++) {
    const h = candles[i].high;
    const l = candles[i].low;
    let isPeak = true, isTrough = true;
    for (let j = 1; j <= window; j++) {
      if (h < candles[i - j].high || h < candles[i + j].high) isPeak = false;
      if (l > candles[i - j].low || l > candles[i + j].low) isTrough = false;
      if (!isPeak && !isTrough) break;
    }
    if (isPeak) peaks.push(h);
    if (isTrough) troughs.push(l);
  }
  const near = (arr: number[]) => {
    if (!arr.length || lastClose == null) return [] as number[];
    return arr
      .sort((a, b) => Math.abs(a - lastClose) - Math.abs(b - lastClose))
      .slice(0, 3)
      .sort((a, b) => a - b);
  };
  return { supports: near(troughs), resistances: near(peaks) };
}

function AnalyzeInner() {
  const search = useSearchParams();
  const symbol = search.get("symbol") || "BTC";
  const pair = search.get("pair") || "BTC/USDT";
  const [data, setData] = useState<{ time: number; open: number; high: number; low: number; close: number }[]>([]);
  const [tf, setTf] = useState("1h");
  const [ind, setInd] = useState<Indicators>({ ma10: false, ma20: true, ma50: false, ma200: false, bb: false, rsi: false, macd: true });
  const [view, setView] = useState<"tv" | "chart">("tv");
  const [mode, setMode] = useState<"scalp" | "intraday" | "swing" | "confluence">("intraday");
  const [th, setTh] = useState(THRESHOLDS);
  const [riskPct, setRiskPct] = useState(0.01); // 1%
  const [equity, setEquity] = useState(1000); // USD example
  const [markMode, setMarkMode] = useState<"entry" | "sl" | "tp" | null>(null);
  const [marks, setMarks] = useState<{ entry?: number; sl?: number; tp?: number }>({});

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

  // Load/save preferences (indicators, thresholds, risk)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("analyze_prefs");
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj.ind) setInd(obj.ind);
        if (obj.th) setTh({ ...THRESHOLDS, ...obj.th });
        if (typeof obj.riskPct === "number") setRiskPct(obj.riskPct);
        if (typeof obj.equity === "number") setEquity(obj.equity);
        if (obj.marks) setMarks(obj.marks);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("analyze_prefs", JSON.stringify({ ind, th, riskPct, equity, marks }));
    } catch {}
  }, [ind, th, riskPct, equity, marks]);

  // Auto set recommended timeframe per mode if user switches mode
  useEffect(() => {
    if (mode === "scalp") {
      setTf("1m");
      setInd({ ma10: false, ma20: true, ma50: false, ma200: false, bb: true, rsi: true, macd: true });
    } else if (mode === "intraday") {
      setTf("5m");
      setInd({ ma10: false, ma20: true, ma50: true, ma200: false, bb: false, rsi: true, macd: true });
    } else if (mode === "swing") {
      setTf("1d");
      setInd({ ma10: false, ma20: false, ma50: true, ma200: true, bb: false, rsi: true, macd: true });
    } else if (mode === "confluence") {
      setTf("1h");
      setInd({ ma10: false, ma20: true, ma50: true, ma200: true, bb: true, rsi: true, macd: true });
    }
  }, [mode]);

  const analysis = useMemo(() => computeSignals(data), [data]);
  const closes = useMemo(() => data.map((d) => d.close), [data]);
  const ma10: { time: number; value: number }[] = useMemo(() => {
    const arr = smaSeries(closes, 10);
    const offset = data.length - arr.length;
    const out: { time: number; value: number }[] = [];
    for (let i = 0; i < arr.length; i++) {
      const idx = i + offset;
      if (idx >= 0 && idx < data.length) out.push({ time: data[idx].time, value: Number(arr[i]) });
    }
    return out;
  }, [closes, data]);
  const ma20L: { time: number; value: number }[] = useMemo(() => {
    const closes = data.map((d) => d.close);
    const arr: number[] = smaSeries(closes, 20);
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
  const ma50: { time: number; value: number }[] = useMemo(() => {
    const arr = smaSeries(closes, 50);
    const offset = data.length - arr.length;
    const out: { time: number; value: number }[] = [];
    for (let i = 0; i < arr.length; i++) {
      const idx = i + offset;
      if (idx >= 0 && idx < data.length) out.push({ time: data[idx].time, value: Number(arr[i]) });
    }
    return out;
  }, [closes, data]);
  const ma200: { time: number; value: number }[] = useMemo(() => {
    const arr = smaSeries(closes, 200);
    const offset = data.length - arr.length;
    const out: { time: number; value: number }[] = [];
    for (let i = 0; i < arr.length; i++) {
      const idx = i + offset;
      if (idx >= 0 && idx < data.length) out.push({ time: data[idx].time, value: Number(arr[i]) });
    }
    return out;
  }, [closes, data]);

  const bb: { time: number; upper: number; middle: number; lower: number }[] = useMemo(() => {
    const period = 20;
    if (closes.length < period) return [];
    const mids = smaSeries(closes, period);
    const out: { time: number; upper: number; middle: number; lower: number }[] = [];
    for (let i = period - 1; i < closes.length; i++) {
      const window = closes.slice(i - period + 1, i + 1);
      const mean = mids[i - (period - 1)];
      const variance = window.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / period;
      const sd = Math.sqrt(variance);
      const time = data[i].time;
      out.push({ time, upper: mean + 2 * sd, middle: mean, lower: mean - 2 * sd });
    }
    return out;
  }, [closes, data]);

  const rsi: SeriesPoint[] = useMemo(() => {
    const arr = rsiSeries(closes, 14);
    const offset = data.length - arr.length;
    const out: SeriesPoint[] = [];
    for (let i = 0; i < arr.length; i++) {
      const idx = i + offset;
      if (idx >= 0 && idx < data.length) out.push({ time: data[idx].time, value: Number(arr[i]) });
    }
    return out;
  }, [closes, data]);

  const macdPts: { macd: SeriesPoint[]; signal: SeriesPoint[] } = useMemo(() => {
    const { macd, signal } = macdLines(closes);
    const offM = data.length - macd.length;
    const offS = data.length - signal.length;
    return {
      macd: macd.map((v, i) => ({ time: data[i + offM].time, value: Number(v) })),
      signal: signal.map((v, i) => ({ time: data[i + offS].time, value: Number(v) })),
    };
  }, [closes, data]);

  const piv = useMemo(() => computePivots(data.slice(-100)), [data]);
  const sr = useMemo(() => computeSR(data.slice(-200), data.at(-1)?.close), [data]);

  const recommendation = useMemo(() => {
    const lastClose = data.at(-1)?.close;
    const lastRSI = (rsi.at(-1)?.value ?? 50) as number;
    const lastMACD = (macdPts.macd.at(-1)?.value ?? 0) as number;
    const lastSignal = (macdPts.signal.at(-1)?.value ?? 0) as number;
    const macdBias = lastMACD - lastSignal;
    const ma20Last = ma20L.at(-1)?.value ?? lastClose ?? 0;
    const ma50Last = ma50.at(-1)?.value ?? lastClose ?? 0;
    const ma200Last = ma200.at(-1)?.value ?? lastClose ?? 0;

    let headline = "Netral";
    if (mode === "scalp") headline = macdBias > 0 && lastRSI < 70 ? "Buy scalp on dips" : macdBias < 0 && lastRSI > 30 ? "Sell scalp on bounce" : "Wait for setup";
    else if (mode === "intraday") headline = lastClose && ma20Last && lastClose > ma20Last && macdBias > 0 ? "Bias Bullish Intraday" : lastClose && ma20Last && lastClose < ma20Last && macdBias < 0 ? "Bias Bearish Intraday" : "Sideways Intraday";
    else if (mode === "swing") headline = lastRSI > 60 && macdBias > 0 ? "Swing Uptrend" : lastRSI < 40 && macdBias < 0 ? "Swing Downtrend" : "Swing Ranging";
    else if (mode === "confluence") headline = macdBias > 0 && lastClose && lastClose > ma20Last ? "Confluence Bullish" : macdBias < 0 && lastClose && lastClose < ma20Last ? "Confluence Bearish" : "Confluence Mixed";

    const notes: string[] = [];
    notes.push(`RSI: ${lastRSI.toFixed(1)}`);
    notes.push(`MACD-Signal: ${(macdBias).toFixed(2)}`);
    if (lastClose && ma20Last) notes.push(`Harga vs MA20: ${((lastClose - ma20Last) / (ma20Last || 1e-9) * 100).toFixed(2)}%`);
    if (lastClose && ma50Last) notes.push(`Harga vs MA50: ${((lastClose - ma50Last) / (ma50Last || 1e-9) * 100).toFixed(2)}%`);
    if (lastClose && ma200Last) notes.push(`Harga vs MA200: ${((lastClose - ma200Last) / (ma200Last || 1e-9) * 100).toFixed(2)}%`);

    // Fibonacci suggestions based on recent swing
    const lookback = Math.min(200, data.length);
    if (lookback > 20) {
      const slice = data.slice(-lookback);
      const highs = slice.map((d) => d.high);
      const lows = slice.map((d) => d.low);
      const swingHigh = Math.max(...highs);
      const swingLow = Math.min(...lows);
      const uptrend = lastClose && lastClose > (ma50Last || 0) && (ma50Last || 0) > (ma200Last || 0);
      const range = swingHigh - swingLow || 1e-9;
      if (uptrend) {
        const r382 = swingHigh - 0.382 * range;
        const r5 = swingHigh - 0.5 * range;
        const r618 = swingHigh - 0.618 * range;
        notes.push(`Fibo retracement (buy-the-dip): 38.2% ${r382.toFixed(2)}, 50% ${r5.toFixed(2)}, 61.8% ${r618.toFixed(2)}`);
        notes.push(`SL di bawah 61.8% (${r618.toFixed(2)}), TP di High ${swingHigh.toFixed(2)} lalu ekstensi 1.272 ~ ${(swingHigh + 0.272 * range).toFixed(2)}`);
      } else {
        const r382 = swingLow + 0.382 * range;
        const r5 = swingLow + 0.5 * range;
        const r618 = swingLow + 0.618 * range;
        notes.push(`Fibo retracement (sell-the-rally): 38.2% ${r382.toFixed(2)}, 50% ${r5.toFixed(2)}, 61.8% ${r618.toFixed(2)}`);
        notes.push(`SL di atas 61.8% (${r618.toFixed(2)}), TP di Low ${swingLow.toFixed(2)} lalu ekstensi 1.272 ~ ${(swingLow - 0.272 * range).toFixed(2)}`);
      }
    }

    if (mode === "scalp") notes.push("Gunakan TF 1m, fokus pada pullback ke MA20. SL ketat di bawah swing minor.");
    if (mode === "intraday") notes.push("Gunakan TF 5m/1h. Entry setelah konfirmasi arah terhadap MA20 dan MACD searah.");
    if (mode === "swing") notes.push("Gunakan TF 1d. Cari higher low/lower high, konfirmasi RSI di atas 60 atau di bawah 40.");
    if (mode === "confluence") notes.push("Cari kesesuaian sinyal antar TF (5m/1h/1d). Hindari entry saat sinyal campur.");

    return { headline, notes };
  }, [data, ma20L, ma50, ma200, rsi, macdPts, mode]);

  // Build horizontal price lines for ChartView (Pivot/SR/Fibo)
  const priceLines = useMemo(() => {
    const lines: { price: number; color?: string; title?: string }[] = [];
    if (piv) {
      lines.push({ price: piv.P, color: "#64748b", title: "P" });
      lines.push({ price: piv.R1, color: "#ef4444", title: "R1" });
      lines.push({ price: piv.R2, color: "#ef4444", title: "R2" });
      lines.push({ price: piv.R3, color: "#ef4444", title: "R3" });
      lines.push({ price: piv.S1, color: "#22c55e", title: "S1" });
      lines.push({ price: piv.S2, color: "#22c55e", title: "S2" });
      lines.push({ price: piv.S3, color: "#22c55e", title: "S3" });
    }
    sr.supports.forEach((p, i) => lines.push({ price: p, color: "#16a34a", title: `Sup${i+1}` }));
    sr.resistances.forEach((p, i) => lines.push({ price: p, color: "#dc2626", title: `Res${i+1}` }));

    // Fibo lines from latest 200 bars
    const lookback = Math.min(200, data.length);
    const lastClose = data.at(-1)?.close;
    if (lookback > 20) {
      const slice = data.slice(-lookback);
      const highs = slice.map((d) => d.high);
      const lows = slice.map((d) => d.low);
      const swingHigh = Math.max(...highs);
      const swingLow = Math.min(...lows);
      const uptrend = lastClose && lastClose > (ma50.at(-1)?.value || 0) && (ma50.at(-1)?.value || 0) > (ma200.at(-1)?.value || 0);
      const range = swingHigh - swingLow || 1e-9;
      if (uptrend) {
        lines.push({ price: swingHigh - 0.382 * range, color: "#a3a3a3", title: "Fibo 38.2%" });
        lines.push({ price: swingHigh - 0.5 * range, color: "#a3a3a3", title: "Fibo 50%" });
        lines.push({ price: swingHigh - 0.618 * range, color: "#a3a3a3", title: "Fibo 61.8%" });
      } else {
        lines.push({ price: swingLow + 0.382 * range, color: "#a3a3a3", title: "Fibo 38.2%" });
        lines.push({ price: swingLow + 0.5 * range, color: "#a3a3a3", title: "Fibo 50%" });
        lines.push({ price: swingLow + 0.618 * range, color: "#a3a3a3", title: "Fibo 61.8%" });
      }
    }
    // User marked lines
    if (marks.entry != null) lines.push({ price: marks.entry, color: "#2563eb", title: "ENTRY" });
    if (marks.sl != null) lines.push({ price: marks.sl, color: "#ef4444", title: "SL" });
    if (marks.tp != null) lines.push({ price: marks.tp, color: "#22c55e", title: "TP" });
    return lines;
  }, [piv, sr, data, ma50, ma200, marks]);

  

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analyze: {symbol}</h1>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Pair: {pair}</div>
        </div>
        <div className="text-xs opacity-80">Timeframe: <span className="rounded-full border px-2 py-0.5">{tf}</span></div>
      </div>
      <div className="mb-3 space-y-3">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <SegmentedTabs
            tabs={[
              { key: "scalp", label: "Scalping" },
              { key: "intraday", label: "Intraday" },
              { key: "swing", label: "Swing" },
              { key: "confluence", label: "Confluence" },
            ]}
            value={mode}
            onChange={(key) => setMode(key as any)}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <SegmentedTabs
              tabs={[{ key: "tv", label: "TradingView" }, { key: "chart", label: "Chart Internal" }]}
              value={view}
              onChange={(key) => setView(key as any)}
            />
            <IndicatorToolbar timeframe={tf} onTimeframe={setTf} indicators={ind} onIndicators={setInd} />
          {/* Threshold & Risk Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <label className="flex items-center gap-1">RSI OB
                <input type="number" className="w-14 rounded border bg-transparent px-2 py-1" value={th.rsiOverbought}
                  onChange={(e) => setTh({ ...th, rsiOverbought: Number(e.target.value) })} />
              </label>
              <label className="flex items-center gap-1">RSI OS
                <input type="number" className="w-14 rounded border bg-transparent px-2 py-1" value={th.rsiOversold}
                  onChange={(e) => setTh({ ...th, rsiOversold: Number(e.target.value) })} />
              </label>
              <label className="flex items-center gap-1">Risk%
                <input type="number" step="0.1" className="w-16 rounded border bg-transparent px-2 py-1" value={(riskPct*100).toFixed(1)}
                  onChange={(e) => setRiskPct(Math.max(0, Number(e.target.value) / 100))} />
              </label>
              <label className="flex items-center gap-1">Equity
                <input type="number" className="w-20 rounded border bg-transparent px-2 py-1" value={equity}
                  onChange={(e) => setEquity(Math.max(0, Number(e.target.value)))} />
              </label>
            </div>
            {/* Marking controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <span>Tandai:</span>
              <button onClick={() => setMarkMode(markMode === "entry" ? null : "entry")} className={`${markMode === "entry" ? "btn-primary" : "btn-secondary"}`}>Entry</button>
              <button onClick={() => setMarkMode(markMode === "sl" ? null : "sl")} className={`${markMode === "sl" ? "btn-primary" : "btn-secondary"}`}>SL</button>
              <button onClick={() => setMarkMode(markMode === "tp" ? null : "tp")} className={`${markMode === "tp" ? "btn-primary" : "btn-secondary"}`}>TP</button>
              <button onClick={() => setMarks({})} className="btn-secondary">Clear</button>
              <div className="text-zinc-600 dark:text-zinc-300">{marks.entry!=null && `E:${marks.entry.toFixed(2)}`} {marks.sl!=null && ` SL:${marks.sl.toFixed(2)}`} {marks.tp!=null && ` TP:${marks.tp.toFixed(2)}`}</div>
            </div>
          </div>
        </div>
      </div>

      {view === "tv" ? (
        <div className="card rounded-xl border bg-white p-3 dark:border-zinc-800 dark:bg-black">
          <TradingView symbol={symbol} pair={pair} timeframe={tf} />
        </div>
      ) : (
        <div className="card rounded-xl border bg-white p-3 dark:border-zinc-800 dark:bg-black">
          <ChartView
            data={data}
            ma10={ind.ma10 ? ma10 : undefined}
            ma20={ind.ma20 ? ma20L : undefined}
            ma50={ind.ma50 ? ma50 : undefined}
            ma200={ind.ma200 ? ma200 : undefined}
            bb={ind.bb ? bb : undefined}
            priceLines={priceLines}
            markMode={markMode}
            onMarked={(price, label) => {
              if (label === "ENTRY") setMarks((m) => ({ ...m, entry: price }));
              if (label === "SL") setMarks((m) => ({ ...m, sl: price }));
              if (label === "TP") setMarks((m) => ({ ...m, tp: price }));
            }}
          />
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-black">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Analisa Otomatis & Rekomendasi</p>
          <div className="mt-1 text-lg font-semibold">{recommendation.headline}</div>
          <ul className="mt-2 list-disc pl-5 text-sm space-y-1 text-zinc-600 dark:text-zinc-300">
            {recommendation.notes.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="card rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-black">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Catatan</p>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Catatan: Indikator RSI/MACD/EMA adalah sederhana untuk demo. Integrasi indikator penuh dapat dilakukan dengan perhitungan teknikal yang lebih lengkap.
          </div>
        </div>
      </div>

      {/* Pivot & Support/Resistance */}
      {(() => {
        const lastClose = data.at(-1)?.close;
        const piv = computePivots(data.slice(-100));
        const sr = computeSR(data.slice(-200), lastClose);
        return (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="card rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-black">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Pivot Levels (Classic)</p>
              {piv ? (
                <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <li>P: {piv.P.toFixed(2)}</li>
                  <li>R1: {piv.R1.toFixed(2)}</li>
                  <li>S1: {piv.S1.toFixed(2)}</li>
                  <li>R2: {piv.R2.toFixed(2)}</li>
                  <li>S2: {piv.S2.toFixed(2)}</li>
                  <li>R3: {piv.R3.toFixed(2)}</li>
                  <li>S3: {piv.S3.toFixed(2)}</li>
                </ul>
              ) : (
                <div className="mt-2 text-sm opacity-70">Data tidak cukup.</div>
              )}
            </div>
            <div className="card rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-black">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Support/Resistance Terdekat</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <div>
                  <div className="font-medium">Support</div>
                  <ul className="list-disc pl-5">
                    {sr.supports.map((v, i) => (<li key={i}>{v.toFixed(2)}</li>))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium">Resistance</div>
                  <ul className="list-disc pl-5">
                    {sr.resistances.map((v, i) => (<li key={i}>{v.toFixed(2)}</li>))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Template Risiko / SL / TP */}
      {(() => {
        const last = data.at(-1);
        if (!last) return null;
        const price = last.close;
        const trendUp = (ma50.at(-1)?.value || 0) > (ma200.at(-1)?.value || 0);
        const entry = trendUp ? (ma20L.at(-1)?.value ?? price) : (ma20L.at(-1)?.value ?? price);
        const sl = trendUp ? Math.min(price, entry) * (1 - 0.006) : Math.max(price, entry) * (1 + 0.006);
        const tp1 = trendUp ? price * (1 + 0.01) : price * (1 - 0.01);
        const tp2 = trendUp ? price * (1 + 0.02) : price * (1 - 0.02);
        const rr1 = Math.abs((tp1 - entry) / (entry - sl));
        const rr2 = Math.abs((tp2 - entry) / (entry - sl));
        const riskAmount = equity * riskPct;
        const perUnitRisk = Math.abs(entry - sl) || 1e-9;
        const positionSize = riskAmount / perUnitRisk;
        return (
          <div className="mt-4 card rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-black">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Template Risiko / SL / TP</p>
            <ul className="mt-2 grid grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li>Harga Saat Ini: {price.toFixed(2)}</li>
              <li>Entry (patokan): {entry.toFixed(2)} {trendUp ? "(buy dip)" : "(sell rally)"}</li>
              <li>Stop Loss: {sl.toFixed(2)}</li>
              <li>Take Profit 1: {tp1.toFixed(2)} (R:R ~ {rr1.toFixed(2)})</li>
              <li>Take Profit 2: {tp2.toFixed(2)} (R:R ~ {rr2.toFixed(2)})</li>
              <li>Risk per trade: {(riskPct * 100).toFixed(1)}% (${riskAmount.toFixed(2)})</li>
              <li>Position size perkiraan: {positionSize.toFixed(4)} unit</li>
            </ul>
            <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">Catatan: Angka ini contoh berbasis MA/Fibo sederhana. Sesuaikan dengan volatilitas dan manajemen risiko Anda.</div>
          </div>
        );
      })()}

      {view === "chart" && (ind.rsi || ind.macd) && (
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
