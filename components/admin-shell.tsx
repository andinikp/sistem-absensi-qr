"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import LoadingState from "./loading-state";

const menu = [
  { href: "/dashboard", label: "Dashboard", ikon: "DB" },
  { href: "/data-mahasiswa", label: "Data Mahasiswa", ikon: "M" },
  { href: "/master-prodi", label: "Master Prodi", ikon: "P" },
  { href: "/master-angkatan", label: "Master Angkatan", ikon: "A" },
  { href: "/scan-absensi", label: "Scan Absensi", ikon: "QR" },
  { href: "/rekap-absensi", label: "Rekap Absensi", ikon: "R" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [siap, setSiap] = useState(false);
  const [keluar, setKeluar] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      router.replace("/login");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login");
      else setSiap(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  async function handleKeluar() {
    setKeluar(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!siap) {
    return (
      <main className="min-h-screen p-6">
        <LoadingState teks="Memeriksa sesi admin..." />
      </main>
    );
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="no-print sticky top-0 z-20 flex h-auto items-center justify-between border-b border-orange-100 bg-white px-4 py-3 shadow-sm lg:h-screen lg:w-72 lg:flex-col lg:items-stretch lg:justify-start lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-sm font-bold text-white">QR</span>
          <span className="hidden leading-tight sm:block">
            <b className="block text-sm text-stone-800">Sistem Absensi</b>
            <small className="text-orange-600">QR Code Mahasiswa</small>
          </span>
        </Link>

        <nav className="hidden gap-2 lg:mt-10 lg:flex lg:flex-col">
          {menu.map((item) => (
            <NavItem key={item.href} {...item} aktif={pathname.startsWith(item.href)} />
          ))}
        </nav>

        <button disabled={keluar} onClick={handleKeluar} className="hidden rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 lg:block">
          {keluar ? "Mengeluarkan..." : "Keluar"}
        </button>
        <button disabled={keluar} onClick={handleKeluar} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 lg:hidden">
          Keluar
        </button>
      </aside>

      <main className="min-w-0 flex-1 pb-20 lg:pb-8">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-20 flex gap-1 overflow-x-auto border-t border-orange-100 bg-white px-2 py-2 shadow-[0_-4px_16px_rgba(124,77,24,0.08)] lg:hidden">
        {menu.map((item) => (
          <NavItem key={item.href} {...item} aktif={pathname.startsWith(item.href)} mobile />
        ))}
      </nav>
    </div>
  );
}

function NavItem({ href, label, ikon, aktif, mobile = false }: { href: string; label: string; ikon: string; aktif: boolean; mobile?: boolean }) {
  return (
    <Link
      href={href}
      className={`${mobile ? "flex min-w-[86px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-center text-[10px]" : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm"} ${
        aktif ? "bg-orange-500 font-semibold text-white" : "text-stone-600 hover:bg-orange-50 hover:text-orange-700"
      }`}
    >
      <span className="text-xs font-bold">{ikon}</span>
      {label}
    </Link>
  );
}
