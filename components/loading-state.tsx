export default function LoadingState({ teks = "Memuat data..." }: { teks?: string }) {
  return <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-orange-100 bg-white p-8 text-sm text-stone-500 shadow-soft">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />{teks}
  </div>;
}
