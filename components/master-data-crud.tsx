"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AlertMessage from "./alert-message";
import EmptyState from "./empty-state";
import LoadingState from "./loading-state";
import { supabase } from "@/lib/supabase";

type NamaTabel = "prodi" | "angkatan";
type NamaKolom = "nama_prodi" | "tahun";
type MasterItem = { id: string; created_at: string } & Record<NamaKolom, string | undefined>;

type Props = {
  tabel: NamaTabel;
  kolom: NamaKolom;
  judul: string;
  deskripsi: string;
  labelInput: string;
  placeholder: string;
  tombolTambah: string;
  labelCari: string;
  placeholderCari: string;
  judulKolom: string;
  inputMode?: "text" | "numeric";
};

function formatTanggalDibuat(nilai: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(nilai));
}

export default function MasterDataCrud({
  tabel,
  kolom,
  judul,
  deskripsi,
  labelInput,
  placeholder,
  tombolTambah,
  labelCari,
  placeholderCari,
  judulKolom,
  inputMode = "text",
}: Props) {
  const [data, setData] = useState<MasterItem[]>([]);
  const [nilai, setNilai] = useState("");
  const [editId, setEditId] = useState("");
  const [cari, setCari] = useState("");
  const [muat, setMuat] = useState(true);
  const [simpan, setSimpan] = useState(false);
  const [menghapus, setMenghapus] = useState("");
  const [galat, setGalat] = useState("");
  const [pesan, setPesan] = useState("");

  async function ambil() {
    setMuat(true);
    setGalat("");
    const { data: hasil, error } = await supabase.from(tabel).select(`id, ${kolom}, created_at`).order(kolom, { ascending: tabel === "prodi" });
    if (error) setGalat(`Data ${judul.toLowerCase()} tidak dapat dimuat. Jalankan migrasi database terbaru.`);
    else setData((hasil ?? []) as MasterItem[]);
    setMuat(false);
  }

  useEffect(() => {
    ambil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabel, kolom]);

  const tersaring = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    if (!kata) return data;
    return data.filter((item) => (item[kolom] ?? "").toLowerCase().includes(kata));
  }, [cari, data, kolom]);

  function mulaiEdit(item: MasterItem) {
    setEditId(item.id);
    setNilai(item[kolom] ?? "");
    setPesan("");
    setGalat("");
  }

  function batalEdit() {
    setEditId("");
    setNilai("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nilaiBersih = nilai.trim();
    setGalat("");
    setPesan("");

    if (!nilaiBersih) {
      setGalat(`${labelInput} wajib diisi.`);
      return;
    }

    setSimpan(true);
    const payload = { [kolom]: nilaiBersih };
    const hasil = editId
      ? await supabase.from(tabel).update(payload).eq("id", editId)
      : await supabase.from(tabel).insert(payload);
    setSimpan(false);

    if (hasil.error) {
      setGalat(hasil.error.code === "23505" ? `${labelInput} sudah terdaftar.` : `Data ${judul.toLowerCase()} tidak dapat disimpan.`);
      return;
    }

    setPesan(editId ? `${judulKolom} berhasil diperbarui.` : `${judulKolom} berhasil ditambahkan.`);
    batalEdit();
    await ambil();
  }

  async function hapus(item: MasterItem) {
    const nama = item[kolom] ?? "";
    if (!window.confirm(`Hapus ${judulKolom.toLowerCase()} "${nama}"?`)) return;

    setMenghapus(item.id);
    setGalat("");
    setPesan("");
    const { error } = await supabase.from(tabel).delete().eq("id", item.id);
    setMenghapus("");

    if (error) {
      setGalat(error.code === "23503" ? `${judulKolom} masih digunakan oleh data mahasiswa dan tidak dapat dihapus.` : `${judulKolom} tidak dapat dihapus.`);
      return;
    }

    setPesan(`${judulKolom} berhasil dihapus.`);
    setData((lama) => lama.filter((baris) => baris.id !== item.id));
  }

  return (
    <>
      <header className="mb-7">
        <p className="text-sm font-medium text-orange-600">Master Data</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">{judul}</h1>
        <p className="mt-2 text-stone-500">{deskripsi}</p>
      </header>

      {pesan && (
        <div className="mb-5">
          <AlertMessage jenis="sukses" pesan={pesan} onClose={() => setPesan("")} />
        </div>
      )}
      {galat && (
        <div className="mb-5">
          <AlertMessage jenis="galat" pesan={galat} onClose={() => setGalat("")} />
        </div>
      )}

      <section className="mb-5 grid gap-5 lg:grid-cols-[minmax(280px,380px)_1fr]">
        <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-stone-900">{editId ? `Edit ${judulKolom}` : tombolTambah}</h2>
          <label className="mt-4 block text-sm font-semibold text-stone-700">
            {labelInput}
            <input
              required
              value={nilai}
              inputMode={inputMode}
              onChange={(event) => setNilai(event.target.value)}
              placeholder={placeholder}
              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 font-normal text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </label>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            {editId && (
              <button type="button" onClick={batalEdit} className="rounded-xl border border-orange-200 px-4 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-50">
                Batal
              </button>
            )}
            <button disabled={simpan} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
              {simpan ? "Menyimpan..." : editId ? "Simpan Perubahan" : tombolTambah}
            </button>
          </div>
        </form>

        <div className="rounded-2xl bg-white p-4 shadow-soft">
          <label className="block text-sm font-semibold text-stone-700">
            {labelCari}
            <input
              value={cari}
              onChange={(event) => setCari(event.target.value)}
              placeholder={placeholderCari}
              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 font-normal outline-none placeholder:text-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </label>
        </div>
      </section>

      {muat ? (
        <LoadingState />
      ) : tersaring.length ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-orange-50 text-xs uppercase tracking-wide text-orange-800">
                <tr>
                  <th className="px-5 py-4 font-semibold">No</th>
                  <th className="px-5 py-4 font-semibold">{judulKolom}</th>
                  <th className="px-5 py-4 font-semibold">Tanggal Dibuat</th>
                  <th className="px-5 py-4 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {tersaring.map((item, index) => (
                  <tr key={item.id} className="hover:bg-cream/60">
                    <td className="px-5 py-4 text-stone-600">{index + 1}</td>
                    <td className="px-5 py-4 font-semibold text-stone-800">{item[kolom]}</td>
                    <td className="px-5 py-4 text-stone-600">{formatTanggalDibuat(item.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => mulaiEdit(item)} className="rounded-lg bg-orange-100 px-2.5 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-200">
                          Edit
                        </button>
                        <button disabled={menghapus === item.id} onClick={() => hapus(item)} className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">
                          {menghapus === item.id ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState judul={`${judulKolom} tidak ditemukan`} deskripsi="Ubah kata kunci pencarian atau tambahkan data baru." />
      )}
    </>
  );
}
