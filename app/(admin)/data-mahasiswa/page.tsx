"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AlertMessage from "@/components/alert-message";
import LoadingState from "@/components/loading-state";
import StudentTable from "@/components/student-table";
import { supabase } from "@/lib/supabase";
import { Mahasiswa } from "@/lib/types";

export default function DataMahasiswaPage() {
  const query = useSearchParams(); const [data, setData] = useState<Mahasiswa[]>([]); const [cari, setCari] = useState(""); const [muat, setMuat] = useState(true); const [galat, setGalat] = useState(""); const [menghapus, setMenghapus] = useState("");
  async function ambil() { setMuat(true); const { data: hasil, error } = await supabase.from("mahasiswa").select("*").order("created_at", { ascending: false }); if (error) setGalat("Data mahasiswa tidak dapat dimuat. Periksa konfigurasi Supabase dan kebijakan akses."); else setData(hasil as Mahasiswa[]); setMuat(false); }
  useEffect(() => { ambil(); }, []);
  const tersaring = useMemo(() => { const kata = cari.toLowerCase(); return data.filter((mhs) => mhs.nama.toLowerCase().includes(kata) || mhs.nim.toLowerCase().includes(kata)); }, [data, cari]);
  async function hapus(mahasiswa: Mahasiswa) { if (!window.confirm(`Hapus data ${mahasiswa.nama}? Data absensi terkait juga akan terhapus.`)) return; setMenghapus(mahasiswa.id); const { error } = await supabase.from("mahasiswa").delete().eq("id", mahasiswa.id); setMenghapus(""); if (error) { setGalat("Data tidak dapat dihapus. Silakan coba lagi."); return; } setData((lama) => lama.filter((item) => item.id !== mahasiswa.id)); }
  const pesan = query.get("pesan");
  return <><header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-orange-600">Master Data</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">Data Mahasiswa</h1><p className="mt-2 text-stone-500">Kelola informasi dan QR Code mahasiswa.</p></div><Link href="/data-mahasiswa/tambah" className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-600">+ Tambah Mahasiswa</Link></header>{pesan && <div className="mb-5"><AlertMessage jenis="sukses" pesan={pesan === "ditambahkan" ? "Data mahasiswa berhasil ditambahkan." : "Data mahasiswa berhasil diperbarui."} /></div>}{galat && <div className="mb-5"><AlertMessage jenis="galat" pesan={galat} onClose={() => setGalat("")} /></div>}<div className="mb-5 rounded-2xl bg-white p-4 shadow-soft"><label className="block text-sm font-semibold text-stone-700">Cari Mahasiswa<input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari berdasarkan nama atau NIM..." className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 font-normal outline-none placeholder:text-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label></div>{muat ? <LoadingState /> : <StudentTable data={tersaring} onDelete={hapus} menghapus={menghapus} />}</>;
}
