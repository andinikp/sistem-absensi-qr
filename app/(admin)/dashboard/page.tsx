"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardCard from "@/components/dashboard-card";
import LoadingState from "@/components/loading-state";
import AlertMessage from "@/components/alert-message";
import { normalisasiAbsensi } from "@/lib/data-mappers";
import { supabase } from "@/lib/supabase";
import { SELECT_ABSENSI_DENGAN_MAHASISWA } from "@/lib/supabase-selects";
import { AbsensiDenganMahasiswa, AbsensiQuery, StatusAbsensi } from "@/lib/types";
import { getTanggalHariIni } from "@/lib/utils";

type ChartItem = { label: string; jumlah: number };

type DashboardData = {
  mahasiswa: number;
  prodi: number;
  angkatan: number;
  hadir: number;
  tidakHadir: number;
  izin: number;
  sakit: number;
  perProdi: ChartItem[];
  perAngkatan: ChartItem[];
};

const dataAwal: DashboardData = {
  mahasiswa: 0,
  prodi: 0,
  angkatan: 0,
  hadir: 0,
  tidakHadir: 0,
  izin: 0,
  sakit: 0,
  perProdi: [],
  perAngkatan: [],
};

function hitungStatus(data: AbsensiDenganMahasiswa[], status: StatusAbsensi) {
  return data.filter((item) => item.status === status).length;
}

function hitungChart(data: AbsensiDenganMahasiswa[], ambilLabel: (item: AbsensiDenganMahasiswa) => string) {
  const peta = new Map<string, number>();
  data.forEach((item) => {
    const label = ambilLabel(item) || "-";
    peta.set(label, (peta.get(label) ?? 0) + 1);
  });
  return [...peta.entries()].map(([label, jumlah]) => ({ label, jumlah })).sort((a, b) => b.jumlah - a.jumlah);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(dataAwal);
  const [muat, setMuat] = useState(true);
  const [galat, setGalat] = useState("");

  useEffect(() => {
    async function ambil() {
      const tanggal = getTanggalHariIni();
      const [mahasiswa, prodi, angkatan, absensiHariIni] = await Promise.all([
        supabase.from("mahasiswa").select("id", { count: "exact", head: true }),
        supabase.from("prodi").select("id", { count: "exact", head: true }),
        supabase.from("angkatan").select("id", { count: "exact", head: true }),
        supabase.from("absensi").select(SELECT_ABSENSI_DENGAN_MAHASISWA).eq("tanggal", tanggal),
      ]);

      if (mahasiswa.error || prodi.error || angkatan.error || absensiHariIni.error) {
        setGalat("Ringkasan tidak dapat dimuat. Pastikan migrasi database terbaru dan kebijakan akses Supabase sudah dijalankan.");
      } else {
        const absensi = ((absensiHariIni.data ?? []) as AbsensiQuery[]).map(normalisasiAbsensi);
        setData({
          mahasiswa: mahasiswa.count ?? 0,
          prodi: prodi.count ?? 0,
          angkatan: angkatan.count ?? 0,
          hadir: hitungStatus(absensi, "Hadir"),
          tidakHadir: hitungStatus(absensi, "Tidak Hadir"),
          izin: hitungStatus(absensi, "Izin"),
          sakit: hitungStatus(absensi, "Sakit"),
          perProdi: hitungChart(absensi, (item) => item.mahasiswa?.prodi ?? "-"),
          perAngkatan: hitungChart(absensi, (item) => item.mahasiswa?.angkatan ?? "-"),
        });
      }
      setMuat(false);
    }

    ambil();
  }, []);

  return (
    <>
      <header className="mb-7">
        <p className="text-sm font-medium text-orange-600">Selamat datang, Admin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">Dashboard</h1>
        <p className="mt-2 text-stone-500">Kelola data mahasiswa dan absensi dengan mudah.</p>
      </header>
      {galat && (
        <div className="mb-5">
          <AlertMessage jenis="galat" pesan={galat} />
        </div>
      )}
      {muat ? (
        <LoadingState />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard judul="Total Mahasiswa" nilai={data.mahasiswa} keterangan="Mahasiswa yang terdaftar" ikon="M" />
            <DashboardCard judul="Total Prodi" nilai={data.prodi} keterangan="Program studi aktif" ikon="P" warna="yellow" />
            <DashboardCard judul="Total Angkatan" nilai={data.angkatan} keterangan="Angkatan terdaftar" ikon="A" warna="cream" />
            <DashboardCard judul="Hadir Hari Ini" nilai={data.hadir} keterangan="Status hadir hari ini" ikon="H" warna="green" />
            <DashboardCard judul="Tidak Hadir" nilai={data.tidakHadir} keterangan="Status tidak hadir hari ini" ikon="T" warna="cream" />
            <DashboardCard judul="Izin" nilai={data.izin} keterangan="Status izin hari ini" ikon="I" warna="yellow" />
            <DashboardCard judul="Sakit" nilai={data.sakit} keterangan="Status sakit hari ini" ikon="S" warna="orange" />
          </section>

          <section className="mt-7 grid gap-5 lg:grid-cols-2">
            <ChartRingkas judul="Absensi per Prodi" data={data.perProdi} />
            <ChartRingkas judul="Absensi per Angkatan" data={data.perAngkatan} />
          </section>

          <section className="mt-7 rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="text-lg font-bold text-stone-900">Mulai dari sini</h2>
            <p className="mt-1 text-sm text-stone-500">Pilih aktivitas yang ingin Anda lakukan hari ini.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link href="/data-mahasiswa/tambah" className="rounded-xl bg-orange-50 p-4 transition hover:bg-orange-100">
                <b className="text-orange-800">+ Tambah Mahasiswa</b>
                <span className="mt-1 block text-sm text-orange-700">Daftarkan mahasiswa dan buat QR Code.</span>
              </Link>
              <Link href="/scan-absensi" className="rounded-xl bg-sunshine-100 p-4 transition hover:bg-sunshine-300">
                <b className="text-orange-800">Scan Absensi</b>
                <span className="mt-1 block text-sm text-orange-700">Catat kehadiran dengan kamera.</span>
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  );
}

function ChartRingkas({ judul, data }: { judul: string; data: ChartItem[] }) {
  const maksimum = Math.max(...data.map((item) => item.jumlah), 1);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="text-lg font-bold text-stone-900">{judul}</h2>
      <div className="mt-5 space-y-4">
        {data.length ? (
          data.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span className="font-semibold text-stone-700">{item.label}</span>
                <span className="text-stone-500">{item.jumlah}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-orange-50">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.max((item.jumlah / maksimum) * 100, 8)}%` }} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-stone-500">Belum ada absensi hari ini.</p>
        )}
      </div>
    </section>
  );
}
