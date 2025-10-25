# Environment Variables

Set these locally in `.env.local` (do not commit) and on Vercel Project Settings → Environment Variables.

Required:
- NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
- ALPHA_VANTAGE_KEY=your_alpha_vantage_api_key
- CRYPTOPANIC_TOKEN=your_cryptopanic_token
- NEXT_PUBLIC_SUPABASE_URL=https://YOUR.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

Optional:
- STOCK_SYMBOLS="AAPL,MSFT,GOOGL,NVDA,TSLA,BBCA.JK,BBRI.JK,BMRI.JK"

Notes:
- AdSense: ganti client di `app/layout.tsx` src query string, dan di komponen `GoogleAds`.
- Supabase: buat tabel `messages (id uuid default gen_random_uuid() primary key, content text, created_at timestamptz default now())` dan aktifkan Realtime untuk tabel tersebut.
