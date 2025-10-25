import { NextResponse } from "next/server";

export const revalidate = 60;

const BASE_PAIRS = ["EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD","EURJPY","EURGBP"];
const MORE_PAIRS = [
  "EURCHF","GBPJPY","AUDJPY","CADJPY","CHFJPY","NZDJPY","EURAUD","EURNZD","GBPAUD","GBPCAD","GBPCHF",
  "AUDCAD","AUDCHF","AUDNZD","CADCHF","NZDCHF","NZDCAD","EURCAD",
];

function normalizePairsParam(pairsParam: string | null): string[] {
  if (!pairsParam) return [...BASE_PAIRS, ...MORE_PAIRS];
  if (pairsParam.toLowerCase() === "all") return [...BASE_PAIRS, ...MORE_PAIRS];
  return pairsParam
    .split(",")
    .map((x) => x.trim().toUpperCase().replace("/", ""))
    .filter((x) => /^[A-Z]{6}$/.test(x));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const list = normalizePairsParam(searchParams.get("pairs"));
  try {
    // FreeForexAPI: https://www.freeforexapi.com/api/live?pairs=EURUSD,GBPUSD
    const url = `https://www.freeforexapi.com/api/live?pairs=${list.join(",")}`;
    const res = await fetch(url, { next: { revalidate } });
    const data = await res.json();
    const rows = list.map((p) => {
      const q = data.rates?.[p];
      const price = q ? q.rate : NaN;
      const change = Math.random() * 2 - 1; // placeholder 24h change (API tidak sediakan)
      const volume = Math.floor(Math.random() * 1_000_000);
      const name = p.slice(0, 3) + "/" + p.slice(3);
      return { name, symbol: p, pair: name, price, change24h: change, volume };
    });
    return NextResponse.json(rows);
  } catch (e) {
    // fallback sederhana
    const rows = list.map((p) => {
      const name = p.slice(0, 3) + "/" + p.slice(3);
      return { name, symbol: p, pair: name, price: 0, change24h: 0, volume: 0 };
    });
    return NextResponse.json(rows, { status: 200 });
  }
}
