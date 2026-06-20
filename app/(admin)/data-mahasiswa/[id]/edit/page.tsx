"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StudentForm from "@/components/student-form";
import LoadingState from "@/components/loading-state";
import AlertMessage from "@/components/alert-message";
import { supabase } from "@/lib/supabase";
import { Mahasiswa } from "@/lib/types";

export default function EditMahasiswaPage() { const { id } = useParams<{ id: string }>(); const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null); const [muat, setMuat] = useState(true); useEffect(() => { supabase.from("mahasiswa").select("*").eq("id", id).single().then(({ data }) => { setMahasiswa(data as Mahasiswa | null); setMuat(false); }); }, [id]); if (muat) return <LoadingState />; if (!mahasiswa) return <><AlertMessage jenis="galat" pesan="Data mahasiswa tidak ditemukan." /><Link href="/data-mahasiswa" className="mt-4 inline-block text-sm font-semibold text-orange-700">← Kembali ke Data Mahasiswa</Link></>; return <><header className="mb-7"><p className="text-sm font-medium text-orange-600">Data Mahasiswa</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">Edit Mahasiswa</h1><p className="mt-2 text-stone-500">Perbarui informasi mahasiswa. Kode QR akan ikut diperbarui jika NIM berubah.</p></header><StudentForm mahasiswa={mahasiswa} /></>; }
