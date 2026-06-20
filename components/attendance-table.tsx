import { AbsensiDenganMahasiswa } from "@/lib/types";
import { formatTanggal } from "@/lib/utils";
import EmptyState from "./empty-state";

export default function AttendanceTable({ data }: { data: AbsensiDenganMahasiswa[] }) {
  if (!data.length) return <EmptyState judul="Belum ada data absensi" deskripsi="Data kehadiran akan tampil setelah QR Code dipindai." />;
  return <div className="overflow-hidden rounded-2xl bg-white shadow-soft"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-orange-50 text-xs uppercase tracking-wide text-orange-800"><tr>{["Nama", "NIM", "Prodi", "Angkatan", "Tanggal", "Jam Masuk", "Status"].map((judul) => <th key={judul} className="px-5 py-4 font-semibold">{judul}</th>)}</tr></thead><tbody className="divide-y divide-stone-100">{data.map((absen) => <tr key={absen.id} className="hover:bg-cream/60"><td className="px-5 py-4 font-semibold">{absen.mahasiswa?.nama ?? "Mahasiswa dihapus"}</td><td className="px-5 py-4 text-stone-600">{absen.mahasiswa?.nim ?? "-"}</td><td className="px-5 py-4 text-stone-600">{absen.mahasiswa?.prodi ?? "-"}</td><td className="px-5 py-4 text-stone-600">{absen.mahasiswa?.angkatan ?? "-"}</td><td className="px-5 py-4 text-stone-600">{formatTanggal(absen.tanggal)}</td><td className="px-5 py-4 text-stone-600">{absen.jam_masuk.slice(0, 5)}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">{absen.status}</span></td></tr>)}</tbody></table></div></div>;
}
