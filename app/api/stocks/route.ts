import { NextResponse } from "next/server";

export const revalidate = 60;

const SYMBOLS = ["AAPL","MSFT","GOOGL","NVDA","TSLA","BBCA.JK","BBRI.JK","BMRI.JK"]; // NASDAQ + IDX sample

export async function GET() {
  const key = process.env.ALPHA_VANTAGE_KEY;
  if (!key) {
    // placeholder data if missing key
    const rows = SYMBOLS.map((s) => ({ name: s, symbol: s, pair: `${s}/USD`, price: 0, change24h: 0, volume: 0 }));
    return NextResponse.json(rows);
  }
  try {
    const out: any[] = [];
    for (const s of SYMBOLS) {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(s)}&apikey=${key}`;
      const res = await fetch(url, { cache: "no-store" }); // respect rate limit in dev
      const data = await res.json();
      const q = data["Global Quote"] || {};
      out.push({
        name: s,
        symbol: s,
        pair: `${s}/USD`,
        price: parseFloat(q["05. price"]) || 0,
        change24h: parseFloat(q["10. change percent"]) || 0,
        volume: parseFloat(q["06. volume"]) || 0,
      });
      await new Promise((r) => setTimeout(r, 200)); // small delay to be friendly
    }
    return NextResponse.json(out);
  } catch (e) {
    const rows = SYMBOLS.map((s) => ({ name: s, symbol: s, pair: `${s}/USD`, price: 0, change24h: 0, volume: 0 }));
    return NextResponse.json(rows);
  }
}
