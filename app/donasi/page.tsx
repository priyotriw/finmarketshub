export const dynamic = "force-dynamic";

export default function DonasiPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dukungan & Donasi</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        Terima kasih telah menggunakan FinMarkets Hub. Donasi Anda membantu biaya server, pengembangan fitur,
        dan pemeliharaan konten. Setiap dukungan sangat berarti.
      </p>

      <div className="mt-4 space-y-4">
        <div className="card rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-black">
          <h2 className="text-sm font-medium">Metode Donasi</h2>
          <ul className="mt-2 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
            <li>
              <span className="font-medium">QRIS:</span> Silakan pindai kode QR berikut (masukkan gambar QR Anda di sini)
            </li>
            <li>
              <span className="font-medium">Transfer Bank:</span> BCA/BNI/BRI (isi sesuai informasi Anda)
            </li>
            <li>
              <span className="font-medium">E-Wallet:</span> Dana/OVO/Gopay (isi sesuai informasi Anda)
            </li>
          </ul>
        </div>

        <div className="card rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-black">
          <h2 className="text-sm font-medium">Catatan</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
            <li>Donasi bersifat sukarela dan tidak mengikat.</li>
            <li>Tidak ada refund karena donasi bukan transaksi produk/jasa.</li>
            <li>Jika ingin tampil di halaman terima kasih, sertakan nama/keterangan saat mengirim.</li>
          </ul>
        </div>

        <div className="card rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-black">
          <h2 className="text-sm font-medium">Kontak</h2>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
            Untuk pertanyaan atau konfirmasi donasi, silakan hubungi kami (isi kontak Anda di sini).
          </p>
        </div>
      </div>
    </section>
  );
}
