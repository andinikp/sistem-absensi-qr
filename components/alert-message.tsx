"use client";

type Props = { jenis?: "sukses" | "galat" | "info"; pesan: string; onClose?: () => void };

const warna = {
  sukses: "border-emerald-200 bg-emerald-50 text-emerald-800",
  galat: "border-red-200 bg-red-50 text-red-800",
  info: "border-orange-200 bg-orange-50 text-orange-800",
};

export default function AlertMessage({ jenis = "info", pesan, onClose }: Props) {
  return <div role="alert" className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${warna[jenis]}`}>
    <span>{pesan}</span>
    {onClose && <button onClick={onClose} aria-label="Tutup pesan" className="font-bold leading-none">×</button>}
  </div>;
}
