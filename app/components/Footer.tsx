export default function Footer() {
  return (
    <footer className="border-t border-zinc-200/50 bg-white/50 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-black/50 dark:text-zinc-400 sm:py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
        <p>© {new Date().getFullYear()} FinMarkets Hub</p>
        <p className="opacity-80">Crypto • Forex • Stocks • News • Community</p>
      </div>
    </footer>
  );
}
