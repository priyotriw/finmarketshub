"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-8 md:grid-cols-2 md:py-12">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold leading-tight sm:text-4xl"
          >
            Portal Analisis & Monitoring Pasar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400"
          >
            Crypto, Forex, dan Saham dalam satu dashboard ringan. Data live, chart interaktif, dan sinyal sederhana.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 flex gap-2"
          >
            <Link href="/analyze" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700">
              Mulai Analisa
            </Link>
            <Link href="/news" className="rounded-full border px-5 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900">
              Lihat Berita
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative h-40 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 p-[1px] md:h-48"
        >
          <div className="h-full w-full rounded-xl bg-white/60 backdrop-blur dark:bg-black/40" />
          <div className="pointer-events-none absolute inset-0 rounded-xl [background:radial-gradient(400px_120px_at_80%_0%,rgba(59,130,246,.25),transparent)]" />
        </motion.div>
      </div>
    </section>
  );
}
