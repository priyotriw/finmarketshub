import { NextResponse } from "next/server";

export const revalidate = 60;

const PAIRS = ["EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD","EURJPY","EURGBP"];

export async function GET() {
  try {
    // FreeForexAPI: https://www.freeforexapi.com/api/live?pairs=EURUSD,GBPUSD
    const url = `https://www.freeforexapi.com/api/live?pairs=${PAIRS.join(",")}`;
    const res = await fetch(url, { next: { revalidate } });
    const data = await res.json();
    const rows = PAIRS.map((p) => {
      const q = data.rates?.[p];
      const price = q ? q.rate : NaN;
      const change = Math.random() * 2 - 1; // placeholder 24h change (API tidak sediakan)
      const volume = Math.floor(Math.random() * 1_000_000);
      return { name: p.slice(0,3)+"/"+p.slice(3), symbol: p, pair: p.slice(0,3)+"/"+p.slice(3), price, change24h: change, volume };
    });
    return NextResponse.json(rows);
  } catch (e) {
    // fallback sederhana
    const rows = PAIRS.map((p) => ({ name: p, symbol: p, pair: p, price: 0, change24h: 0, volume: 0 }));
    return NextResponse.json(rows, { status: 200 });
  }
}
