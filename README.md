## FinMarkets Hub

Portal analisis & pemantauan pasar (Crypto, Forex, Stocks) dengan dashboard live, halaman analisa (chart + sinyal otomatis), berita, chatroom realtime, dan Google AdSense.

## Setup Lokal

1) Install dependencies
```bash
npm install
```
2) Buat file `.env.local` (lihat variabel di `docs/ENV.md`)
3) Jalankan dev server
```bash
npm run dev
```
Buka http://localhost:3000

## ENV yang Dibutuhkan
Lihat `docs/ENV.md`.
Kunci penting:
- NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
- ALPHA_VANTAGE_KEY=...
- CRYPTOPANIC_TOKEN=...
- NEXT_PUBLIC_SUPABASE_URL=...
- NEXT_PUBLIC_SUPABASE_ANON_KEY=...

## Build Production
```bash
npm run build && npm start
```

## Deploy ke Vercel
Pilihan A: UI Vercel
- Push repo ini ke GitHub/GitLab/Bitbucket
- Import project di https://vercel.com/new
- Set Environment Variables sesuai `docs/ENV.md`
- Deploy

Pilihan B: CLI
```bash
npm i -g vercel
vercel login
vercel
# untuk produksi
vercel --prod
```
Pastikan Environment Variables di Project Settings Vercel sudah terisi.

## Catatan
- AdSense tidak selalu tampil di mode development; gunakan domain produksi yang di-approve.
- API Alpha Vantage memiliki rate limit; gunakan kunci Anda sendiri.
- Supabase: buat tabel `messages` dan aktifkan Realtime untuk chat.
