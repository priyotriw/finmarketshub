import GoogleAds from "@/app/components/GoogleAds";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Tentang FinMarkets Hub</h1>
        <p className="mt-2 text-sm opacity-80">
          Pusat analisis dan pemantauan pasar untuk Crypto, Forex, dan Saham. Dibangun agar ringkas, cepat, dan mudah dipakai
          untuk kebutuhan pantauan harian maupun riset ringan.
        </p>
      </header>

      <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
        <h2 className="text-lg font-semibold">Misi & Nilai</h2>
        <ul className="mt-2 list-disc pl-5 text-sm opacity-90">
          <li>Memberi akses informasi pasar yang cepat dan mudah dipahami.</li>
          <li>Meminimalkan gangguan visual dengan desain yang fokus pada data.</li>
          <li>Menyediakan alat bantu sederhana untuk analisis teknikal awal.</li>
        </ul>
      </section>

      <div className="my-4" />

      <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
        <h2 className="text-lg font-semibold">Fitur Utama</h2>
        <ul className="mt-2 list-disc pl-5 text-sm opacity-90">
          <li>Dashboard pasar dengan tab Crypto/Forex/Stocks, pencarian cepat, dan interaksi klik baris.</li>
          <li>Analyze: chart dengan overlay EMA, pane indikator RSI & MACD, dan sinyal otomatis sederhana.</li>
          <li>News: kurasi berita pasar dengan kategori serta tombol Load More.</li>
          <li>Watchlist: tandai aset favorit dan akses cepat dari sidebar.</li>
          <li>Top Movers: pantauan gainer/loser 24 jam (crypto).</li>
          <li>Dark/Light mode yang stabil (berbasis class).</li>
        </ul>
      </section>

      <div className="my-4" />

      <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
        <h2 className="text-lg font-semibold">Sumber Data</h2>
        <ul className="mt-2 list-disc pl-5 text-sm opacity-90">
          <li>Crypto: Binance public API (fallback saat API tidak tersedia).</li>
          <li>Forex: FreeForexAPI (fallback disediakan bila gagal).</li>
          <li>Stocks: Alpha Vantage (gunakan kunci API untuk data real).</li>
          <li>News: CryptoPanic (gunakan token untuk feed real).</li>
        </ul>
        <p className="mt-2 text-xs opacity-70">Catatan: Data dapat mengalami keterlambatan dan hanya untuk tujuan informasi.</p>
      </section>

      <div className="my-4" />

      <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
        <h2 className="text-lg font-semibold">Disclaimer</h2>
        <p className="mt-2 text-sm opacity-90">
          Konten di situs ini bersifat informatif. Bukan merupakan nasihat keuangan, investasi, atau perdagangan.
          Lakukan riset mandiri dan pertimbangkan profil risiko Anda sebelum mengambil keputusan.
        </p>
      </section>

      <div className="my-4" />

      <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
        <h2 className="text-lg font-semibold">Privasi & Monetisasi</h2>
        <ul className="mt-2 list-disc pl-5 text-sm opacity-90">
          <li>Iklan Google AdSense digunakan untuk mendukung biaya operasional.</li>
          <li>Kami tidak menjual data pengguna. Analitik anonim dapat dipakai untuk perbaikan layanan.</li>
        </ul>
      </section>

      <div className="my-4" />

      <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
        <h2 className="text-lg font-semibold">Kontak & Dukungan</h2>
        <ul className="mt-2 list-disc pl-5 text-sm opacity-90">
          <li>Email: <a className="underline" href="mailto:admin@finmarkets.example">admin@finmarkets.example</a></li>
          <li>Donasi: QRIS/Saweria, atau PayPal (opsional).</li>
          <li>Saran/bug report: buka issue di repository GitHub.</li>
        </ul>
      </section>

      <div className="my-4" />

      <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
        <h2 className="text-lg font-semibold">Roadmap Singkat</h2>
        <ul className="mt-2 list-disc pl-5 text-sm opacity-90">
          <li>Integrasi data chart real-time untuk simbol populer.</li>
          <li>Peningkatan watchlist (sinkronisasi akun) dan notifikasi harga.</li>
          <li>Heatmap lintas aset dan lebih banyak preset indikator.</li>
        </ul>
      </section>

      <GoogleAds slot="1796447374" />
    </div>
  );
}
