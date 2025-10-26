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
            <Link href="/news" className="btn-secondary text-sm">
              Lihat Berita
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="relative h-40 rounded-xl p-2 md:h-48"
        >
          <div className="card flex h-full w-full items-center justify-center rounded-xl border bg-white dark:border-zinc-800 dark:bg-black">
            <div className="w-full">
              <div className="mx-auto max-w-sm">
                <div className="text-center text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Advertisement</div>
                <div className="mt-2">
                  {/* Replace slot with your AdSense slot id */}
                  <div className="rounded-lg border border-dashed p-2 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <span className="opacity-80">AdSense</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
