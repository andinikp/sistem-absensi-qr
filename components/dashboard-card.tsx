type Props = { judul: string; nilai: number | string; keterangan: string; ikon: string; warna?: "orange" | "yellow" | "cream" | "green" };
const gaya = {
  orange: "bg-orange-500 text-white", yellow: "bg-sunshine-300 text-stone-800", cream: "bg-orange-100 text-orange-800", green: "bg-emerald-100 text-emerald-800",
};
export default function DashboardCard({ judul, nilai, keterangan, ikon, warna = "orange" }: Props) {
  return <article className={`rounded-2xl p-5 shadow-soft ${gaya[warna]}`}>
    <div className="flex items-start justify-between"><div><p className="text-sm font-medium opacity-80">{judul}</p><p className="mt-2 text-3xl font-bold tracking-tight">{nilai}</p></div><span className="rounded-xl bg-white/25 p-2 text-2xl">{ikon}</span></div>
    <p className="mt-4 text-xs opacity-80">{keterangan}</p>
  </article>;
}
