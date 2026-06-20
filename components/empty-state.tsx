export default function EmptyState({ judul = "Belum ada data", deskripsi = "Data akan muncul di sini setelah tersedia." }: { judul?: string; deskripsi?: string }) {
  return <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 px-6 py-12 text-center">
    <div className="mb-3 text-3xl">📚</div><h3 className="font-semibold text-stone-800">{judul}</h3><p className="mt-1 text-sm text-stone-500">{deskripsi}</p>
  </div>;
}
