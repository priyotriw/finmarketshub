"use client";
import { useEffect } from "react";

type Props = { slot: string };
export default function GoogleAds({ slot }: Props) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-xxxxxxxxxxxxxxxx";
  useEffect(() => {
    if (!client.includes("xxxxxxxx")) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, []);
  if (client.includes("xxxxxxxx")) {
    return (
      <div className="my-4 flex h-24 w-full items-center justify-center rounded-md border border-dashed text-xs text-zinc-500 dark:text-zinc-400">
        Ad Placeholder (set NEXT_PUBLIC_ADSENSE_CLIENT to enable)
      </div>
    );
  }
  return (
    <ins
      className="adsbygoogle block text-center my-4"
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
