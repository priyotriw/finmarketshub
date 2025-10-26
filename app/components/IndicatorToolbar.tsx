"use client";
import SegmentedTabs from "@/app/components/SegmentedTabs";
import { useEffect, useState } from "react";

export type Indicators = {
  ma10: boolean;
  ma20: boolean;
  ma50: boolean;
  ma200: boolean;
  bb: boolean; // Bollinger Bands (20,2)
  rsi: boolean;
  macd: boolean;
};

export default function IndicatorToolbar({
  timeframe,
  onTimeframe,
  indicators,
  onIndicators,
}: {
  timeframe: string;
  onTimeframe: (tf: string) => void;
  indicators: Indicators;
  onIndicators: (next: Indicators) => void;
}) {
  const enabledCount = Object.values(indicators).filter(Boolean).length;
  const [presets, setPresets] = useState<Record<string, Indicators>>({});
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("indicator_presets");
      if (raw) setPresets(JSON.parse(raw));
    } catch {}
  }, []);
  const savePresets = (next: Record<string, Indicators>) => {
    setPresets(next);
    try { localStorage.setItem("indicator_presets", JSON.stringify(next)); } catch {}
  };
  const saveCurrentAsPreset = () => {
    const name = prompt("Nama preset indikator?");
    if (!name) return;
    const next = { ...presets, [name]: indicators };
    savePresets(next);
    setSelectedPreset(name);
  };
  const applyPreset = (name: string) => {
    const p = presets[name];
    if (!p) return;
    onIndicators(p);
  };
  const deletePreset = (name: string) => {
    if (!name) return;
    if (!confirm(`Hapus preset "${name}"?`)) return;
    const next = { ...presets };
    delete next[name];
    savePresets(next);
    setSelectedPreset("");
  };
  const enabledLabels = Object.entries(indicators)
    .filter(([, v]) => v)
    .map(([k]) => k.toUpperCase())
    .join(", ");
  const toggleGroup = (group: "ma" | "momvol", on: boolean) => {
    if (group === "ma") {
      onIndicators({
        ...indicators,
        ma10: on,
        ma20: on,
        ma50: on,
        ma200: on,
      });
    } else {
      onIndicators({
        ...indicators,
        rsi: on,
        macd: on,
        bb: on,
      });
    }
  };
  const tips: Record<string, string> = {
    ma10: "Moving Average 10: tren jangka sangat pendek",
    ma20: "Moving Average 20: tren pendek",
    ma50: "Moving Average 50: tren menengah",
    ma200: "Moving Average 200: tren jangka panjang",
    rsi: "Relative Strength Index: momentum overbought/oversold",
    macd: "MACD: persilangan momentum EMA (12,26,9)",
    bb: "Bollinger Bands: deviasi standar volatilitas",
  };
  return (
    <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <label className="text-xs text-zinc-600 dark:text-zinc-300">Timeframe</label>
        <select
          className="rounded-md border bg-white px-2 py-1 text-sm dark:border-zinc-800 dark:bg-black"
          value={timeframe}
          onChange={(e) => onTimeframe(e.target.value)}
        >
          <option value="1m">1m</option>
          <option value="5m">5m</option>
          <option value="1h">1h</option>
          <option value="1d">1d</option>
        </select>
      </div>
      <details className="group rounded-md border px-3 py-2 text-sm dark:border-zinc-800">
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
          <span className="inline-flex items-center gap-2">Indikator
            <span className="ml-1 inline-flex items-center rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-700 dark:text-yellow-400">{enabledCount} aktif</span>
          </span>
          <span className="ml-2 inline-block rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-700 dark:text-yellow-400">atur</span>
        </summary>
        <div className="mt-2 space-y-2">
          {/* Preset controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-zinc-500 dark:text-zinc-400">Preset</label>
              <select
                className="rounded-md border bg-white px-2 py-1 text-xs dark:border-zinc-800 dark:bg-black"
                value={selectedPreset}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPreset(val);
                  if (val) applyPreset(val);
                }}
              >
                <option value="">— pilih —</option>
                {Object.keys(presets).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" className="btn-secondary px-2 py-1 text-[11px]" onClick={saveCurrentAsPreset}>Simpan</button>
              <button
                type="button"
                className="btn-secondary px-2 py-1 text-[11px]"
                onClick={() => selectedPreset && deletePreset(selectedPreset)}
                disabled={!selectedPreset}
                title={!selectedPreset ? "Pilih preset terlebih dahulu" : "Hapus preset ini"}
              >
                Hapus
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Pilih indikator untuk ditampilkan</div>
            <div className="flex gap-1">
              <button
                type="button"
                className="btn-secondary px-2 py-1 text-[11px]"
                onClick={() => onIndicators({ ma10: true, ma20: true, ma50: true, ma200: true, bb: true, rsi: true, macd: true })}
              >
                Semua
              </button>
              <button
                type="button"
                className="btn-secondary px-2 py-1 text-[11px]"
                onClick={() => onIndicators({ ma10: false, ma20: false, ma50: false, ma200: false, bb: false, rsi: false, macd: false })}
              >
                Kosongkan
              </button>
            </div>
          </div>
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            <span className="text-zinc-500 dark:text-zinc-400">Preset:</span>
            <button type="button" className="btn-secondary px-2 py-1" onClick={() => onIndicators({ ma10: false, ma20: true, ma50: false, ma200: false, bb: true, rsi: true, macd: true })}>Scalp</button>
            <button type="button" className="btn-secondary px-2 py-1" onClick={() => onIndicators({ ma10: false, ma20: true, ma50: true, ma200: false, bb: false, rsi: true, macd: true })}>Intraday</button>
            <button type="button" className="btn-secondary px-2 py-1" onClick={() => onIndicators({ ma10: false, ma20: false, ma50: true, ma200: true, bb: false, rsi: true, macd: true })}>Swing</button>
            <button type="button" className="btn-secondary px-2 py-1" onClick={() => onIndicators({ ma10: false, ma20: true, ma50: true, ma200: true, bb: true, rsi: true, macd: true })}>Confluence</button>
          </div>

          {/* Grouped indicators */
          }
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            <div className="col-span-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:col-span-3 md:col-span-4">
              <span>Moving Averages</span>
              <span className="flex gap-1">
                <button type="button" className="btn-secondary px-2 py-0.5" onClick={() => toggleGroup("ma", true)}>Aktifkan</button>
                <button type="button" className="btn-secondary px-2 py-0.5" onClick={() => toggleGroup("ma", false)}>Nonaktif</button>
              </span>
            </div>
            {[
              { key: "ma10", label: "MA10" },
              { key: "ma20", label: "MA20" },
              { key: "ma50", label: "MA50" },
              { key: "ma200", label: "MA200" },
            ].map((it) => (
              <label key={it.key} title={tips[it.key]} className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
                <input type="checkbox" checked={(indicators as any)[it.key]} onChange={(e) => onIndicators({ ...indicators, [it.key]: e.target.checked })} />
                {it.label}
              </label>
            ))}
            <div className="col-span-2 mt-1 flex items-center justify-between text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:col-span-3 md:col-span-4">
              <span>Momentum & Volatility</span>
              <span className="flex gap-1">
                <button type="button" className="btn-secondary px-2 py-0.5" onClick={() => toggleGroup("momvol", true)}>Aktifkan</button>
                <button type="button" className="btn-secondary px-2 py-0.5" onClick={() => toggleGroup("momvol", false)}>Nonaktif</button>
              </span>
            </div>
            {[
              { key: "rsi", label: "RSI" },
              { key: "macd", label: "MACD" },
              { key: "bb", label: "Bollinger" },
            ].map((it) => (
              <label key={it.key} title={tips[it.key]} className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
                <input type="checkbox" checked={(indicators as any)[it.key]} onChange={(e) => onIndicators({ ...indicators, [it.key]: e.target.checked })} />
                {it.label}
              </label>
            ))}
          </div>
          {/* Active summary */}
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {enabledCount > 0 ? `Aktif: ${enabledLabels}` : "Tidak ada indikator aktif"}
          </div>
        </div>
      </details>
    </div>
  );
}
