import { AbsensiDenganMahasiswa, STATUS_ABSENSI, StatusAbsensi } from "@/lib/types";
import { formatTanggal } from "@/lib/utils";
import EmptyState from "./empty-state";

const warnaStatus: Record<StatusAbsensi, string> = {
  Hadir: "bg-emerald-100 text-emerald-700",
  "Tidak Hadir": "bg-red-100 text-red-700",
  Izin: "bg-blue-100 text-blue-700",
  Sakit: "bg-yellow-100 text-yellow-800",
};

export default function AttendanceTable({
  data,
  onUbahStatus,
  menyimpanStatus,
}: {
  data: AbsensiDenganMahasiswa[];
  onUbahStatus?: (id: string, status: StatusAbsensi) => void;
  menyimpanStatus?: string;
}) {
  if (!data.length) return <EmptyState judul="Belum ada data absensi" deskripsi="Data kehadiran akan tampil setelah QR Code dipindai atau generate tidak hadir dijalankan." />;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-orange-50 text-xs uppercase tracking-wide text-orange-800">
            <tr>
              {["Nama", "NIM", "Prodi", "Angkatan", "Tanggal", "Jam Masuk", "Status"].map((judul) => (
                <th key={judul} className="px-5 py-4 font-semibold">
                  {judul}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {data.map((absen) => (
              <tr key={absen.id} className="hover:bg-cream/60">
                <td className="px-5 py-4 font-semibold">{absen.mahasiswa?.nama ?? "Mahasiswa dihapus"}</td>
                <td className="px-5 py-4 text-stone-600">{absen.mahasiswa?.nim ?? "-"}</td>
                <td className="px-5 py-4 text-stone-600">{absen.mahasiswa?.prodi ?? "-"}</td>
                <td className="px-5 py-4 text-stone-600">{absen.mahasiswa?.angkatan ?? "-"}</td>
                <td className="px-5 py-4 text-stone-600">{formatTanggal(absen.tanggal)}</td>
                <td className="px-5 py-4 text-stone-600">{absen.jam_masuk ? absen.jam_masuk.slice(0, 5) : "-"}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${warnaStatus[absen.status]}`}>{absen.status}</span>
                    {onUbahStatus && (
                      <select
                        value={absen.status}
                        disabled={menyimpanStatus === absen.id}
                        onChange={(event) => onUbahStatus(absen.id, event.target.value as StatusAbsensi)}
                        className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
                      >
                        {STATUS_ABSENSI.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
