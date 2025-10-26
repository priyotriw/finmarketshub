"use client";
import { useEffect } from "react";

export default function GoogleAds({ slot }: { slot: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  useEffect(() => {
    if (!client || !slot) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [client, slot]);
  if (!client || !slot) {
    return (
      <div className="my-3 rounded-xl border bg-white p-3 text-xs opacity-70 dark:border-zinc-800 dark:bg-black">
        Ad placeholder (pastikan NEXT_PUBLIC_ADSENSE_CLIENT dan slot iklan terisi)
      </div>
    );
  }
  return (
    <div className="my-3">
      <ins
        className="adsbygoogle"
        style={{ display: "block" } as any}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      {/* Script loader disuntik lewat app/layout.tsx saat client tersedia */}
    </div>
  );
}
