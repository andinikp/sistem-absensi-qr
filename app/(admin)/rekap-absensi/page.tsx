"use client";

import { useEffect, useMemo, useState } from "react";
import AttendanceTable from "@/components/attendance-table";
import AlertMessage from "@/components/alert-message";
import LoadingState from "@/components/loading-state";
import { supabase } from "@/lib/supabase";
import { AbsensiDenganMahasiswa } from "@/lib/types";
import { getTanggalHariIni } from "@/lib/utils";

export default function RekapAbsensiPage() {
  const [data, setData] = useState<AbsensiDenganMahasiswa[]>([]);
  const [tanggal, setTanggal] = useState("");
  const [prodi, setProdi] = useState("");
  const [angkatan, setAngkatan] = useState("");
  const [cari, setCari] = useState("");
  const [muat, setMuat] = useState(true);
  const [galat, setGalat] = useState("");
  useEffect(() => {
    async function ambil() {
      try {
        const { data: hasil, error } = await supabase
          .from("absensi")
          .select(
            "id, mahasiswa_id, kode_mahasiswa, tanggal, jam_masuk, status, created_at, mahasiswa(nama, nim, prodi, angkatan)",
          )
          .order("tanggal", { ascending: false })
          .order("jam_masuk", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          setGalat(`Data rekap tidak dapat dimuat: ${error.message}`);
        } else if (!hasil) {
          console.warn("Data kosong dari Supabase");
          setData([]);
        } else {
          setData(hasil as unknown as AbsensiDenganMahasiswa[]);
        }
      } catch (err) {
        console.error("Unexpected error fetching data:", err);
        setGalat(
          "Terjadi kesalahan saat memuat data. Silakan refresh halaman.",
        );
      }
      setMuat(false);
    }
    ambil();
  }, []);
  const pilihanProdi = useMemo(
    () =>
      [
        ...new Set(data.map((item) => item.mahasiswa?.prodi).filter(Boolean)),
      ].sort(),
    [data],
  );
  const pilihanAngkatan = useMemo(
    () =>
      [
        ...new Set(
          data.map((item) => item.mahasiswa?.angkatan).filter(Boolean),
        ),
      ].sort(),
    [data],
  );
  const hasil = useMemo(
    () =>
      data.filter((item) => {
        const mhs = item.mahasiswa;
        const kata = cari.toLowerCase();
        return (
          (!tanggal || item.tanggal === tanggal) &&
          (!prodi || mhs?.prodi === prodi) &&
          (!angkatan || mhs?.angkatan === angkatan) &&
          (!kata ||
            mhs?.nama.toLowerCase().includes(kata) ||
            mhs?.nim.toLowerCase().includes(kata))
        );
      }),
    [data, tanggal, prodi, angkatan, cari],
  );
  function resetFilter() {
    setTanggal("");
    setProdi("");
    setAngkatan("");
    setCari("");
  }
  return (
    <>
      <header className="mb-7">
        <p className="text-sm font-medium text-orange-600">Laporan Kehadiran</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
          Rekap Absensi
        </h1>
        <p className="mt-2 text-stone-500">
          Lihat dan filter riwayat kehadiran mahasiswa.
        </p>
      </header>
      {galat && (
        <div className="mb-5">
          <AlertMessage jenis="galat" pesan={galat} />
        </div>
      )}
      <section className="mb-5 rounded-2xl bg-white p-4 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <InputFilter
            label="Tanggal"
            type="date"
            value={tanggal}
            onChange={setTanggal}
          />
          <SelectFilter
            label="Program Studi"
            value={prodi}
            onChange={setProdi}
            pilihan={pilihanProdi as string[]}
          />
          <SelectFilter
            label="Angkatan"
            value={angkatan}
            onChange={setAngkatan}
            pilihan={pilihanAngkatan as string[]}
          />
          <InputFilter
            label="Cari Nama / NIM"
            value={cari}
            onChange={setCari}
            placeholder="Ketik nama atau NIM"
          />
          <div className="flex items-end">
            <button
              onClick={resetFilter}
              className="w-full rounded-xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50"
            >
              Reset Filter
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs text-stone-500">
          Menampilkan {hasil.length} data absensi.{" "}
          <button
            onClick={() => setTanggal(getTanggalHariIni())}
            className="font-semibold text-orange-700 underline"
          >
            Tampilkan hari ini
          </button>
        </p>
      </section>
      {muat ? <LoadingState /> : <AttendanceTable data={hasil} />}
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}
function SelectFilter({
  label,
  value,
  onChange,
  pilihan,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  pilihan: string[];
}) {
  return (
    <label className="block text-xs font-semibold text-stone-600">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
      >
        <option value="">Semua {label.toLowerCase()}</option>
        {pilihan.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}
