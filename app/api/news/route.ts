import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET(req: Request) {
  const token = process.env.CRYPTOPANIC_TOKEN;
  if (!token) {
    // Fallback contoh artikel agar halaman tidak kosong saat token belum diisi
    const now = new Date().toISOString();
    const articles = [
      { id: 1, title: "Bitcoin menembus resistance utama", url: "https://example.com/bitcoin", published_at: now, domain: "example.com", source: "Demo News" },
      { id: 2, title: "EUR/USD menguat setelah rilis data CPI", url: "https://example.com/eurusd", published_at: now, domain: "example.com", source: "Demo News" },
      { id: 3, title: "Saham teknologi memimpin reli Nasdaq", url: "https://example.com/nasdaq", published_at: now, domain: "example.com", source: "Demo News" },
    ];
    return NextResponse.json({ articles, nextPage: null }, { status: 200 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${token}&public=true${page ? `&page=${page}` : ""}`;
    const res = await fetch(url, { next: { revalidate } });
    const data = await res.json();
    const articles = (data.results || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      published_at: r.published_at,
      domain: r.domain,
      source: r.source?.title,
    }));
    const nextPage = data.next ? Number((new URL(data.next)).searchParams.get("page")) : null;
    return NextResponse.json({ articles, nextPage });
  } catch (e) {
    return NextResponse.json({ articles: [] });
  }
}
