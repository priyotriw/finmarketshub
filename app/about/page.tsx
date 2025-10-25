import GoogleAds from "@/app/components/GoogleAds";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-semibold">Tentang & Donasi</h1>
      <p className="opacity-80">Portal analisis dan pemantauan pasar: Crypto, Forex, dan Saham. Kontak: admin@finmarkets.example</p>
      <div className="mt-4 rounded-md border p-4">
        <p className="font-medium">Dukungan</p>
        <ul className="mt-1 text-sm list-disc pl-5">
          <li>QRIS / Saweria (tambahkan gambar/tautan Anda)</li>
          <li>PayPal: paypal.me/yourid</li>
        </ul>
      </div>
      <GoogleAds slot="1234567892" />
    </div>
  );
}
