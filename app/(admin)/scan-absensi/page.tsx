"use client";

import { useState } from "react";
import Scanner from "@/components/scanner";
import AlertMessage from "@/components/alert-message";
import { supabase } from "@/lib/supabase";
import { Mahasiswa } from "@/lib/types";
import { getJamSekarang, getTanggalHariIni } from "@/lib/utils";

type ErrorDatabase = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function pesanDatabase(error: unknown) {
  const errorDatabase = error as ErrorDatabase;
  const code = errorDatabase?.code ?? "";
  const message =
    error instanceof Error
      ? error.message
      : errorDatabase?.message ?? "";

  if (code === "42501")
    return "Akses absensi ditolak. Silakan masuk kembali sebagai admin, lalu scan ulang.";
  if (code === "42P01")
    return "Tabel absensi belum tersedia. Jalankan supabase/schema.sql di Supabase SQL Editor.";
  if (code === "PGRST116")
    return "Akses data ditolak. Pastikan Anda sudah login dan Row Level Security sudah dikonfigurasi.";
  if (code === "23503")
    return "Mahasiswa tidak ditemukan di database. Silakan tambahkan mahasiswa terlebih dahulu.";
  if (code === "22007")
    return "Format waktu absensi tidak valid. Silakan muat ulang halaman lalu scan kembali.";

  if (/failed to fetch|networkerror|load failed/i.test(message))
    return "Tidak dapat terhubung ke Supabase. Periksa koneksi internet serta URL dan API key Supabase.";

  // Fallback untuk error yang tidak dikenali
  return message || "Data absensi tidak dapat disimpan. Silakan coba lagi.";
}

export default function ScanAbsensiPage() {
  const [proses, setProses] = useState(false);
  const [pesan, setPesan] = useState("");
  const [jenis, setJenis] = useState<"sukses" | "galat" | "info">("info");
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null);
  async function validasi(kode: string) {
    try {
      setProses(true);
      setPesan("");
      setMahasiswa(null);

      // 1. Cari mahasiswa berdasarkan kode
      const { data, error: mhsError } = await supabase
        .from("mahasiswa")
        .select("*")
        .eq("kode_mahasiswa", kode.trim())
        .maybeSingle();

      if (mhsError) {
        setJenis("galat");
        setPesan(pesanDatabase(mhsError));
        setProses(false);
        return;
      }

      if (!data) {
        setJenis("galat");
        setPesan("QR Code tidak valid atau mahasiswa tidak ditemukan.");
        setProses(false);
        return;
      }

      const mhs = data as Mahasiswa;
      setMahasiswa(mhs);

      // 2. Cek absensi hari ini
      const tanggal = getTanggalHariIni();
      const { data: sebelumnya, error: cekError } = await supabase
        .from("absensi")
        .select("id")
        .eq("mahasiswa_id", mhs.id)
        .eq("tanggal", tanggal)
        .maybeSingle();

      if (cekError) {
        setJenis("galat");
        setPesan(pesanDatabase(cekError));
        setProses(false);
        return;
      }

      if (sebelumnya) {
        setJenis("info");
        setPesan("Mahasiswa sudah melakukan absensi hari ini.");
        setProses(false);
        return;
      }

      // 3. Simpan absensi baru
      const { error: simpanError } = await supabase.from("absensi").insert({
        mahasiswa_id: mhs.id,
        kode_mahasiswa: mhs.kode_mahasiswa,
        tanggal,
        jam_masuk: getJamSekarang(),
        status: "Hadir",
      });

      if (simpanError) {
        const isDuplicate = simpanError?.code === "23505";
        setJenis(isDuplicate ? "info" : "galat");
        setPesan(
          isDuplicate
            ? "Mahasiswa sudah melakukan absensi hari ini."
            : pesanDatabase(simpanError),
        );
        setProses(false);
        return;
      }

      setJenis("sukses");
      setPesan("Absensi berhasil disimpan.");
    } catch (err) {
      setJenis("galat");
      setPesan("Terjadi kesalahan tidak terduga. Silakan coba lagi.");
    } finally {
      setProses(false);
    }
  }
  return (
    <>
      <header className="mb-7">
        <p className="text-sm font-medium text-orange-600">
          Pencatatan Kehadiran
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
          Scan Absensi
        </h1>
        <p className="mt-2 text-stone-500">
          Arahkan QR Code mahasiswa ke kamera untuk mencatat kehadiran.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Scanner onScan={validasi} memproses={proses} />
        <aside className="space-y-4">
          {pesan ? (
            <AlertMessage jenis={jenis} pesan={pesan} />
          ) : (
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
              <h2 className="font-bold text-orange-900">Petunjuk Scan</h2>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-orange-800">
                <li>1. Izinkan akses kamera saat diminta.</li>
                <li>2. Arahkan QR Code ke kotak kamera.</li>
                <li>3. Tunggu validasi kehadiran.</li>
              </ol>
            </div>
          )}
          {mahasiswa && (
            <div className="rounded-2xl bg-white p-5 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                Mahasiswa Terdeteksi
              </p>
              <h2 className="mt-2 text-lg font-bold text-stone-900">
                {mahasiswa.nama}
              </h2>
              <dl className="mt-4 space-y-2 text-sm">
                <Data label="NIM" nilai={mahasiswa.nim} />
                <Data label="Prodi" nilai={mahasiswa.prodi} />
                <Data label="Angkatan" nilai={mahasiswa.angkatan} />
                <Data label="Kode" nilai={mahasiswa.kode_mahasiswa} />
              </dl>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
function Data({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-stone-500">{label}</dt>
      <dd className="text-right font-semibold text-stone-800">{nilai}</dd>
    </div>
  );
}
