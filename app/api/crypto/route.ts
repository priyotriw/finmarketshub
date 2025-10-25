import { NextResponse } from "next/server";

export const revalidate = 10;

export async function GET() {
  try {
    // Binance 24hr ticker for all symbols, then filter USDT and slice 100
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr", { next: { revalidate } });
    const data = await res.json();
    const rows = data
      .filter((d: any) => d.symbol.endsWith("USDT"))
      .slice(0, 100)
      .map((d: any) => ({
        name: d.symbol.replace("USDT", ""),
        symbol: d.symbol.replace("USDT", ""),
        pair: `${d.symbol.replace(/(USDT)$/,'')}/USDT`,
        price: parseFloat(d.lastPrice),
        change24h: parseFloat(d.priceChangePercent),
        volume: parseFloat(d.quoteVolume),
      }));
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
