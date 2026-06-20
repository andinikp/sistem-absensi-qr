"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "./alert-message";
import { supabase } from "@/lib/supabase";
import { Mahasiswa } from "@/lib/types";
import { buatKodeMahasiswa } from "@/lib/utils";

type Props = { mahasiswa?: Mahasiswa };
export default function StudentForm({ mahasiswa }: Props) {
  const router = useRouter(); const edit = Boolean(mahasiswa); const [simpan, setSimpan] = useState(false); const [galat, setGalat] = useState("");
  const [form, setForm] = useState({ nama: mahasiswa?.nama ?? "", nim: mahasiswa?.nim ?? "", prodi: mahasiswa?.prodi ?? "", angkatan: mahasiswa?.angkatan ?? "" });
  const ubah = (field: keyof typeof form, value: string) => setForm((lama) => ({ ...lama, [field]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault(); setGalat("");
    if (!form.nama.trim() || !form.nim.trim() || !form.prodi.trim() || !form.angkatan.trim()) { setGalat("Semua data mahasiswa wajib diisi."); return; }
    setSimpan(true); const kode_mahasiswa = buatKodeMahasiswa(form.nim); const data = { ...form, nama: form.nama.trim(), nim: form.nim.trim(), prodi: form.prodi.trim(), angkatan: form.angkatan.trim(), kode_mahasiswa, qr_code: kode_mahasiswa };
    const hasil = edit ? await supabase.from("mahasiswa").update(data).eq("id", mahasiswa!.id) : await supabase.from("mahasiswa").insert(data);
    setSimpan(false);
    if (hasil.error) { setGalat(hasil.error.code === "23505" ? "NIM sudah terdaftar. Gunakan NIM lain." : "Data tidak dapat disimpan. Silakan coba lagi."); return; }
    router.push(`/data-mahasiswa?pesan=${edit ? "diperbarui" : "ditambahkan"}`); router.refresh();
  }
  return <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-5 shadow-soft sm:p-7">
    {galat && <AlertMessage jenis="galat" pesan={galat} onClose={() => setGalat("")} />}
    <Field label="Nama Lengkap" value={form.nama} onChange={(v) => ubah("nama", v)} placeholder="Contoh: Siti Nurhaliza" />
    <div className="grid gap-5 sm:grid-cols-2"><Field label="NIM" value={form.nim} onChange={(v) => ubah("nim", v)} placeholder="Contoh: 20241001" /><Field label="Program Studi" value={form.prodi} onChange={(v) => ubah("prodi", v)} placeholder="Contoh: Teknik Informatika" /></div>
    <Field label="Angkatan" value={form.angkatan} onChange={(v) => ubah("angkatan", v)} placeholder="Contoh: 2024" />
    <div className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-800">Kode mahasiswa akan dibuat otomatis: <b>{form.nim ? buatKodeMahasiswa(form.nim) : "MHS-[NIM]"}</b></div>
    <div className="flex flex-wrap justify-end gap-3 pt-2"><button type="button" onClick={() => router.back()} className="rounded-xl border border-orange-200 px-5 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-50">Batal</button><button disabled={simpan} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">{simpan ? "Menyimpan..." : "Simpan Data"}</button></div>
  </form>;
}
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block text-sm font-semibold text-stone-700">{label}<input required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 font-normal text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label>;
}
