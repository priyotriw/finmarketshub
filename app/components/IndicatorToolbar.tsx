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
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <SegmentedTabs
        tabs={[
          { key: "1m", label: "1m" },
          { key: "5m", label: "5m" },
          { key: "1h", label: "1h" },
          { key: "1d", label: "1d" },
        ]}
        value={timeframe}
        onChange={onTimeframe}
      />
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "ma10", label: "MA10" },
          { key: "ma20", label: "MA20" },
          { key: "ma50", label: "MA50" },
          { key: "ma200", label: "MA200" },
          { key: "bb", label: "Bollinger" },
          { key: "rsi", label: "RSI" },
          { key: "macd", label: "MACD" },
        ].map((it) => (
          <label key={it.key} className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900">
            <input
              type="checkbox"
              checked={(indicators as any)[it.key]}
              onChange={(e) => onIndicators({ ...indicators, [it.key]: e.target.checked })}
            />
            {it.label}
          </label>
        ))}
      </div>
    </div>
  );
}
