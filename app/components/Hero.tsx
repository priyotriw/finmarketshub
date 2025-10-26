"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-3 py-6 md:grid-cols-2 md:gap-8 md:px-4 md:py-10">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
          >
            Portal Analisis & Monitoring Pasar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.04 }}
            className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400"
          >
            Crypto, Forex, dan Saham dalam satu dashboard ringan. Data live, chart interaktif, dan sinyal sederhana.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="mt-4 flex gap-2"
          >
            <Link href="/analyze" className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-medium text-black shadow-sm ring-1 ring-yellow-500/20 hover:bg-yellow-400">
              Mulai Analisa
            </Link>
            <Link href="/news" className="rounded-full border px-5 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900">
              Lihat Berita
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="relative h-40 rounded-xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 p-[1px] md:h-48"
        >
          <div className="h-full w-full rounded-xl bg-white/60 backdrop-blur-sm dark:bg-black/40" />
          <div className="pointer-events-none absolute inset-0 rounded-xl [background:radial-gradient(380px_110px_at_80%_0%,rgba(59,130,246,.18),transparent)]" />
        </motion.div>
      </div>
    </section>
  );
}
