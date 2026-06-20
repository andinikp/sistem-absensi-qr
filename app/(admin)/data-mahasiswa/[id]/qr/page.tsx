"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCodeCard from "@/components/qr-code-card";
import LoadingState from "@/components/loading-state";
import AlertMessage from "@/components/alert-message";
import { supabase } from "@/lib/supabase";
import { Mahasiswa } from "@/lib/types";

export default function QRMahasiswaPage() {
  const { id } = useParams<{ id: string }>();
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null);
  const [muat, setMuat] = useState(true);

  useEffect(() => {
    supabase.from("mahasiswa").select("*").eq("id", id).single().then(({ data }) => {
      setMahasiswa(data as Mahasiswa | null);
      setMuat(false);
    });
  }, [id]);

  if (muat) return <LoadingState />;
  if (!mahasiswa) return <><AlertMessage jenis="galat" pesan="Data mahasiswa tidak ditemukan." /><Link href="/data-mahasiswa" className="mt-4 inline-block text-sm font-semibold text-orange-700">← Kembali ke Data Mahasiswa</Link></>;

  return <>
    <header className="no-print mx-auto mb-6 flex max-w-md items-center justify-between"><Link href="/data-mahasiswa" className="text-sm font-semibold text-orange-700 hover:text-orange-900">← Kembali</Link><span className="text-sm text-stone-500">Detail QR Code</span><span className="w-14" /></header>
    <QRCodeCard mahasiswa={mahasiswa} />
  </>;
}
