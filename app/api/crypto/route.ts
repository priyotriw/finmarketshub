import { NextResponse } from "next/server";

export const revalidate = 10;

export async function GET() {
  try {
    // Binance 24hr ticker for all symbols, then filter USDT and slice 100
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr", { next: { revalidate } });
    if (!res.ok) throw new Error("binance not ok");
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
    // Fallback data jika Binance tidak dapat diakses
    const FALLBACK = [
      { s: "BTC", p: 68000, c: 1.23, v: 25000000000 },
      { s: "ETH", p: 3600, c: -0.84, v: 12000000000 },
      { s: "BNB", p: 550, c: 0.35, v: 3000000000 },
      { s: "SOL", p: 160, c: 2.1, v: 5000000000 },
      { s: "XRP", p: 0.58, c: -1.2, v: 1800000000 },
    ];
    const rows = FALLBACK.map((d) => ({
      name: d.s,
      symbol: d.s,
      pair: `${d.s}/USDT`,
      price: d.p,
      change24h: d.c,
      volume: d.v,
    }));
    return NextResponse.json(rows, { status: 200 });
  }
}
