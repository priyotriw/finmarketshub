import { NextResponse } from "next/server";

export const revalidate = 60;

// Curated list (can be expanded). Mix of US large caps and IDX popular tickers.
const ALL_SYMBOLS = [
  "AAPL","MSFT","GOOGL","NVDA","AMZN","META","TSLA","BRK.B","V","JPM","JNJ","WMT","PG","MA","XOM","HD","UNH","ABBV","LLY","KO","PEP","AVGO","COST","CSCO","ADBE","NFLX","CRM","INTC","NKE","AMD",
  "BBCA.JK","BBRI.JK","BMRI.JK","BBNI.JK","ASII.JK","TLKM.JK","ICBP.JK","UNVR.JK","ANTM.JK","MDKA.JK","BBTN.JK","BBKP.JK","BSDE.JK","PTBA.JK","PGAS.JK"
];

function paginate<T>(arr: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return arr.slice(start, start + perPage);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = Math.min(50, Math.max(5, Number(searchParams.get("perPage") || 20)));
  const list = paginate(ALL_SYMBOLS, page, perPage);
  const key = process.env.ALPHA_VANTAGE_KEY;

  // If no key, return placeholders for the requested page
  if (!key) {
    const rows = list.map((s) => ({ name: s, symbol: s, pair: `${s}/USD`, price: 0, change24h: 0, volume: 0 }));
    return NextResponse.json({ rows, page, perPage, total: ALL_SYMBOLS.length });
  }
  try {
    const out: any[] = [];
    for (const s of list) {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(s)}&apikey=${key}`;
      const res = await fetch(url, { cache: "no-store" }); // respect rate limit in prod
      const data = await res.json();
      const q = data["Global Quote"] || {};
      out.push({
        name: s,
        symbol: s,
        pair: `${s}/USD`,
        price: parseFloat(q["05. price"]) || 0,
        change24h: parseFloat((q["10. change percent"] || "").toString().replace("%", "")) || 0,
        volume: parseFloat(q["06. volume"]) || 0,
      });
      await new Promise((r) => setTimeout(r, 250)); // friendly delay for rate limits
    }
    return NextResponse.json({ rows: out, page, perPage, total: ALL_SYMBOLS.length });
  } catch (e) {
    const rows = list.map((s) => ({ name: s, symbol: s, pair: `${s}/USD`, price: 0, change24h: 0, volume: 0 }));
    return NextResponse.json({ rows, page, perPage, total: ALL_SYMBOLS.length });
  }
}
