"use client";
import SegmentedTabs from "@/app/components/SegmentedTabs";

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
          <span>Indikator</span>
          <span className="ml-2 inline-block rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-700 dark:text-yellow-400">pilih</span>
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { key: "ma10", label: "MA10" },
            { key: "ma20", label: "MA20" },
            { key: "ma50", label: "MA50" },
            { key: "ma200", label: "MA200" },
            { key: "bb", label: "Bollinger" },
            { key: "rsi", label: "RSI" },
            { key: "macd", label: "MACD" },
          ].map((it) => (
            <label key={it.key} className="inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <input
                type="checkbox"
                checked={(indicators as any)[it.key]}
                onChange={(e) => onIndicators({ ...indicators, [it.key]: e.target.checked })}
              />
              {it.label}
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}
