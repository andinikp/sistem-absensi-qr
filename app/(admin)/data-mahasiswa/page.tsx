"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AlertMessage from "@/components/alert-message";
import LoadingState from "@/components/loading-state";
import StudentTable from "@/components/student-table";
import { useMasterData } from "@/hooks/use-master-data";
import { normalisasiMahasiswa } from "@/lib/data-mappers";
import { SELECT_MAHASISWA_DENGAN_MASTER } from "@/lib/supabase-selects";
import { supabase } from "@/lib/supabase";
import { Mahasiswa, MahasiswaQuery } from "@/lib/types";

export default function DataMahasiswaPage() {
  return (
    <Suspense fallback={<LoadingState teks="Memuat data mahasiswa..." />}>
      <DataMahasiswaContent />
    </Suspense>
  );
}

function DataMahasiswaContent() {
  const query = useSearchParams();
  const { prodi, angkatan, galatMaster } = useMasterData();
  const [data, setData] = useState<Mahasiswa[]>([]);
  const [filter, setFilter] = useState({ nama: "", nim: "", prodi_id: "", angkatan_id: "" });
  const [muat, setMuat] = useState(true);
  const [galat, setGalat] = useState("");
  const [menghapus, setMenghapus] = useState("");

  async function ambil() {
    setMuat(true);
    setGalat("");
    const { data: hasil, error } = await supabase.from("mahasiswa").select(SELECT_MAHASISWA_DENGAN_MASTER).order("created_at", { ascending: false });
    if (error) setGalat("Data mahasiswa tidak dapat dimuat. Pastikan migrasi relasi prodi dan angkatan sudah dijalankan.");
    else setData(((hasil ?? []) as MahasiswaQuery[]).map(normalisasiMahasiswa));
    setMuat(false);
  }

  useEffect(() => {
    ambil();
  }, []);

  const tersaring = useMemo(() => {
    const nama = filter.nama.trim().toLowerCase();
    const nim = filter.nim.trim().toLowerCase();
    return data.filter((mhs) => {
      return (
        (!nama || mhs.nama.toLowerCase().includes(nama)) &&
        (!nim || mhs.nim.toLowerCase().includes(nim)) &&
        (!filter.prodi_id || mhs.prodi_id === filter.prodi_id) &&
        (!filter.angkatan_id || mhs.angkatan_id === filter.angkatan_id)
      );
    });
  }, [data, filter]);

  function ubahFilter(field: keyof typeof filter, value: string) {
    setFilter((lama) => ({ ...lama, [field]: value }));
  }

  function resetFilter() {
    setFilter({ nama: "", nim: "", prodi_id: "", angkatan_id: "" });
  }

  async function hapus(mahasiswa: Mahasiswa) {
    if (!window.confirm(`Hapus data ${mahasiswa.nama}? Data absensi terkait juga akan terhapus.`)) return;
    setMenghapus(mahasiswa.id);
    const { error } = await supabase.from("mahasiswa").delete().eq("id", mahasiswa.id);
    setMenghapus("");
    if (error) {
      setGalat("Data tidak dapat dihapus. Silakan coba lagi.");
      return;
    }
    setData((lama) => lama.filter((item) => item.id !== mahasiswa.id));
  }

  const pesan = query.get("pesan");

  return (
    <>
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-orange-600">Master Data</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">Data Mahasiswa</h1>
          <p className="mt-2 text-stone-500">Kelola informasi, relasi prodi, angkatan, dan QR Code mahasiswa.</p>
        </div>
        <Link href="/data-mahasiswa/tambah" className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-600">
          + Tambah Mahasiswa
        </Link>
      </header>

      {pesan && (
        <div className="mb-5">
          <AlertMessage jenis="sukses" pesan={pesan === "ditambahkan" ? "Data mahasiswa berhasil ditambahkan." : "Data mahasiswa berhasil diperbarui."} />
        </div>
      )}
      {(galat || galatMaster) && (
        <div className="mb-5">
          <AlertMessage jenis="galat" pesan={galat || galatMaster} onClose={() => setGalat("")} />
        </div>
      )}

      <section className="mb-5 rounded-2xl bg-white p-4 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <InputFilter label="Nama" value={filter.nama} onChange={(value) => ubahFilter("nama", value)} placeholder="Cari nama" />
          <InputFilter label="NIM" value={filter.nim} onChange={(value) => ubahFilter("nim", value)} placeholder="Cari NIM" />
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
          <div className="flex items-end">
            <button onClick={resetFilter} className="w-full rounded-xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50">
              Reset Filter
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs text-stone-500">Menampilkan {tersaring.length} data mahasiswa.</p>
      </section>

      {muat ? <LoadingState /> : <StudentTable data={tersaring} onDelete={hapus} menghapus={menghapus} />}
    </>
  );
}

function InputFilter({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block text-xs font-semibold text-stone-600">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
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
