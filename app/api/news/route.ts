import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET(req: Request) {
  const token = process.env.CRYPTOPANIC_TOKEN;
  if (!token) return NextResponse.json({ articles: [] });
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
