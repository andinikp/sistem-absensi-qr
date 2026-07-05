"use client";

import { useEffect, useMemo, useState } from "react";
import AttendanceTable from "@/components/attendance-table";
import AlertMessage from "@/components/alert-message";
import LoadingState from "@/components/loading-state";
import { useMasterData } from "@/hooks/use-master-data";
import { normalisasiAbsensi, normalisasiMahasiswa } from "@/lib/data-mappers";
import { exportRekapExcel, exportRekapPdf } from "@/lib/export";
import { supabase } from "@/lib/supabase";
import { SELECT_ABSENSI_DENGAN_MAHASISWA, SELECT_MAHASISWA_DENGAN_MASTER } from "@/lib/supabase-selects";
import { AbsensiDenganMahasiswa, AbsensiQuery, MahasiswaQuery, STATUS_ABSENSI, StatusAbsensi } from "@/lib/types";
import { getTanggalHariIni } from "@/lib/utils";

export default function RekapAbsensiPage() {
  const { prodi, angkatan, galatMaster } = useMasterData();
  const [data, setData] = useState<AbsensiDenganMahasiswa[]>([]);
  const [filter, setFilter] = useState({ tanggal: "", prodi_id: "", angkatan_id: "", status: "", nama: "", nim: "" });
  const [muat, setMuat] = useState(true);
  const [galat, setGalat] = useState("");
  const [pesan, setPesan] = useState("");
  const [jenisPesan, setJenisPesan] = useState<"sukses" | "galat" | "info">("sukses");
  const [generate, setGenerate] = useState(false);
  const [menyimpanStatus, setMenyimpanStatus] = useState("");

  async function ambil() {
    setMuat(true);
    setGalat("");
    const { data: hasil, error } = await supabase
      .from("absensi")
      .select(SELECT_ABSENSI_DENGAN_MAHASISWA)
      .order("tanggal", { ascending: false })
      .order("jam_masuk", { ascending: false, nullsFirst: false });

    if (error) setGalat(`Data rekap tidak dapat dimuat: ${error.message}`);
    else setData(((hasil ?? []) as AbsensiQuery[]).map(normalisasiAbsensi));
    setMuat(false);
  }

  useEffect(() => {
    ambil();
  }, []);

  const hasil = useMemo(() => {
    const nama = filter.nama.trim().toLowerCase();
    const nim = filter.nim.trim().toLowerCase();
    return data.filter((item) => {
      const mhs = item.mahasiswa;
      return (
        (!filter.tanggal || item.tanggal === filter.tanggal) &&
        (!filter.prodi_id || mhs?.prodi_id === filter.prodi_id) &&
        (!filter.angkatan_id || mhs?.angkatan_id === filter.angkatan_id) &&
        (!filter.status || item.status === filter.status) &&
        (!nama || mhs?.nama.toLowerCase().includes(nama)) &&
        (!nim || mhs?.nim.toLowerCase().includes(nim))
      );
    });
  }, [data, filter]);

  function ubahFilter(field: keyof typeof filter, value: string) {
    setFilter((lama) => ({ ...lama, [field]: value }));
  }

  function resetFilter() {
    setFilter({ tanggal: "", prodi_id: "", angkatan_id: "", status: "", nama: "", nim: "" });
  }

  async function generateTidakHadir() {
    setGenerate(true);
    setGalat("");
    setPesan("");
    const tanggal = getTanggalHariIni();

    const [hasilMahasiswa, hasilAbsensi] = await Promise.all([
      supabase.from("mahasiswa").select(SELECT_MAHASISWA_DENGAN_MASTER),
      supabase.from("absensi").select("mahasiswa_id").eq("tanggal", tanggal),
    ]);

    if (hasilMahasiswa.error || hasilAbsensi.error) {
      setGalat("Generate Tidak Hadir gagal. Pastikan migrasi database terbaru sudah dijalankan.");
      setGenerate(false);
      return;
    }

    const daftarMahasiswa = ((hasilMahasiswa.data ?? []) as MahasiswaQuery[]).map(normalisasiMahasiswa);
    const sudahAbsensi = new Set((hasilAbsensi.data ?? []).map((item) => item.mahasiswa_id));
    const belumAbsensi = daftarMahasiswa.filter((mahasiswa) => !sudahAbsensi.has(mahasiswa.id));

    if (!belumAbsensi.length) {
      setJenisPesan("info");
      setPesan("Semua mahasiswa sudah memiliki data absensi hari ini.");
      setGenerate(false);
      setFilter((lama) => ({ ...lama, tanggal }));
      return;
    }

    const payload = belumAbsensi.map((mahasiswa) => ({
      mahasiswa_id: mahasiswa.id,
      kode_mahasiswa: mahasiswa.kode_mahasiswa,
      tanggal,
      jam_masuk: null,
      status: "Tidak Hadir",
    }));

    const { error } = await supabase.from("absensi").upsert(payload, { onConflict: "mahasiswa_id,tanggal", ignoreDuplicates: true });
    if (error) {
      setGalat("Data Tidak Hadir tidak dapat dibuat. Pastikan kolom jam_masuk sudah boleh kosong dan status absensi sudah diperbarui.");
      setGenerate(false);
      return;
    }

    setJenisPesan("sukses");
    setPesan(`${belumAbsensi.length} mahasiswa berhasil diberi status Tidak Hadir.`);
    setFilter((lama) => ({ ...lama, tanggal }));
    await ambil();
    setGenerate(false);
  }

  async function ubahStatus(id: string, status: StatusAbsensi) {
    setMenyimpanStatus(id);
    setGalat("");
    const { error } = await supabase.from("absensi").update({ status }).eq("id", id);
    setMenyimpanStatus("");

    if (error) {
      setGalat("Status absensi tidak dapat diperbarui.");
      return;
    }

    setData((lama) => lama.map((item) => (item.id === id ? { ...item, status } : item)));
    setJenisPesan("sukses");
    setPesan("Status absensi berhasil diperbarui.");
  }

  return (
    <>
      <header className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-orange-600">Laporan Kehadiran</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">Rekap Absensi</h1>
          <p className="mt-2 text-stone-500">Lihat, filter, ubah status, dan export riwayat kehadiran mahasiswa.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={generateTidakHadir} disabled={generate} className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60">
            {generate ? "Memproses..." : "Generate Tidak Hadir"}
          </button>
          <button onClick={() => exportRekapPdf(hasil)} disabled={!hasil.length} className="rounded-xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50">
            Export PDF
          </button>
          <button onClick={() => exportRekapExcel(hasil)} disabled={!hasil.length} className="rounded-xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50">
            Export Excel
          </button>
        </div>
      </header>

      {pesan && (
        <div className="mb-5">
          <AlertMessage jenis={jenisPesan} pesan={pesan} onClose={() => setPesan("")} />
        </div>
      )}
      {(galat || galatMaster) && (
        <div className="mb-5">
          <AlertMessage jenis="galat" pesan={galat || galatMaster} onClose={() => setGalat("")} />
        </div>
      )}

      <section className="mb-5 rounded-2xl bg-white p-4 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
          <InputFilter label="Tanggal" type="date" value={filter.tanggal} onChange={(value) => ubahFilter("tanggal", value)} />
          <SelectFilter label="Prodi" value={filter.prodi_id} onChange={(value) => ubahFilter("prodi_id", value)}>
            {prodi.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama_prodi}
              </option>
            ))}
          </SelectFilter>
          <SelectFilter label="Angkatan" value={filter.angkatan_id} onChange={(value) => ubahFilter("angkatan_id", value)}>
            {angkatan.map((item) => (
              <option key={item.id} value={item.id}>
                {item.tahun}
              </option>
            ))}
          </SelectFilter>
          <SelectFilter label="Status" value={filter.status} onChange={(value) => ubahFilter("status", value)}>
            {STATUS_ABSENSI.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectFilter>
          <InputFilter label="Nama" value={filter.nama} onChange={(value) => ubahFilter("nama", value)} placeholder="Cari nama" />
          <InputFilter label="NIM" value={filter.nim} onChange={(value) => ubahFilter("nim", value)} placeholder="Cari NIM" />
          <div className="flex items-end">
            <button onClick={resetFilter} className="w-full rounded-xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50">
              Reset Filter
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs text-stone-500">
          Menampilkan {hasil.length} data absensi.{" "}
          <button onClick={() => ubahFilter("tanggal", getTanggalHariIni())} className="font-semibold text-orange-700 underline">
            Tampilkan hari ini
          </button>
        </p>
      </section>

      {muat ? <LoadingState /> : <AttendanceTable data={hasil} onUbahStatus={ubahStatus} menyimpanStatus={menyimpanStatus} />}
    </>
  );
}

function InputFilter({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-semibold text-stone-600">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
    </label>
  );
}

function SelectFilter({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-stone-600">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100">
        <option value="">Semua {label.toLowerCase()}</option>
        {children}
      </select>
    </label>
  );
}
