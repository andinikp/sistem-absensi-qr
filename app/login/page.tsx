"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/alert-message";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [galat, setGalat] = useState(""); const [masuk, setMasuk] = useState(false);
  useEffect(() => { if (isSupabaseConfigured) supabase.auth.getSession().then(({ data }) => { if (data.session) router.replace("/dashboard"); }); }, [router]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setGalat("");
    if (!email.trim()) { setGalat("Email wajib diisi."); return; } if (!password) { setGalat("Password wajib diisi."); return; }
    if (!isSupabaseConfigured) { setGalat("Supabase belum diatur. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY pada .env.local."); return; }
    setMasuk(true); const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); setMasuk(false);
    if (error) { setGalat("Login gagal. Periksa email dan password."); return; } router.replace("/dashboard"); router.refresh();
  }
  return <main className="relative grid min-h-screen overflow-hidden bg-cream lg:grid-cols-2"><div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sunshine-300/35" /><div className="absolute -bottom-32 left-[35%] h-80 w-80 rounded-full bg-orange-200/45" />
    <section className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20"><div className="mb-10 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500 text-2xl text-white shadow-soft">▣</span><span><b className="block text-stone-900">Sistem Absensi</b><span className="text-sm text-orange-700">QR Code Mahasiswa</span></span></div><div className="max-w-md"><span className="inline-block rounded-full bg-sunshine-100 px-3 py-1 text-xs font-bold text-orange-800">PORTAL ADMIN</span><h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl">Absensi lebih cepat, data lebih rapi.</h1><p className="mt-5 max-w-sm leading-7 text-stone-600">Kelola data mahasiswa dan catat kehadiran cukup dengan satu pemindaian QR Code.</p><div className="mt-9 hidden grid-cols-3 gap-3 sm:grid"><Feature ikon="⚡" teks="Cepat" /><Feature ikon="✓" teks="Akurat" /><Feature ikon="▣" teks="Tanpa kertas" /></div></div></section>
    <section className="relative z-10 flex items-center bg-white/70 px-6 py-10 backdrop-blur-sm sm:px-12 lg:px-20"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft sm:p-8"><h2 className="text-2xl font-bold text-stone-900">Masuk sebagai Admin</h2><p className="mt-2 text-sm text-stone-500">Gunakan akun admin Supabase Anda untuk melanjutkan.</p>{galat && <div className="mt-5"><AlertMessage jenis="galat" pesan={galat} onClose={() => setGalat("")} /></div>}<label className="mt-6 block text-sm font-semibold text-stone-700">Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@kampus.ac.id" className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 font-normal outline-none placeholder:text-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label><label className="mt-5 block text-sm font-semibold text-stone-700">Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 font-normal outline-none placeholder:text-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label><button disabled={masuk} className="mt-7 w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60">{masuk ? "Memproses..." : "Masuk"}</button><p className="mt-5 text-center text-xs leading-5 text-stone-400">Akun dibuat melalui Supabase Auth. Password tidak disimpan di tabel aplikasi.</p></form></section>
  </main>;
}
function Feature({ ikon, teks }: { ikon: string; teks: string }) { return <div className="rounded-2xl bg-white/75 p-3 text-center text-xs font-semibold text-stone-700 shadow-sm"><span className="mb-1 block text-lg">{ikon}</span>{teks}</div>; }
