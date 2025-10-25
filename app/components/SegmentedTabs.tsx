"use client";
import { motion } from "framer-motion";

type Tab = { key: string; label: string };

export default function SegmentedTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Tab[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border bg-white p-1 text-sm shadow-sm dark:border-zinc-800 dark:bg-black">
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`relative z-0 rounded-full px-3 py-1.5 transition-colors ${
              active ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {active && (
              <motion.span
                layoutId="segmented-tabs"
                className="absolute inset-0 -z-10 rounded-full bg-zinc-100 dark:bg-zinc-900"
                transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.3 }}
              />
            )}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
