"use client";

import { useEffect, useRef, useState } from "react";
import AlertMessage from "./alert-message";

type Props = { onScan: (nilai: string) => Promise<void> | void; memproses?: boolean };
export default function Scanner({ onScan, memproses = false }: Props) {
  const scanner = useRef<{ stop: () => Promise<void>; pause: (shouldPauseVideo?: boolean) => void; resume: () => void } | null>(null); const [mulai, setMulai] = useState(false); const [galat, setGalat] = useState(""); const [terpindai, setTerpindai] = useState(false);
  useEffect(() => {
    let dibatalkan = false;
    async function jalankan() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode"); if (dibatalkan) return;
        const pemindai = new Html5Qrcode("area-pemindai"); scanner.current = pemindai;
        await pemindai.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 230, height: 230 }, aspectRatio: 1 }, async (teks) => {
          if (terpindai || dibatalkan) return; setTerpindai(true); pemindai.pause(true); await onScan(teks);
        }, () => undefined); setMulai(true);
      } catch { if (!dibatalkan) setGalat("Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan."); }
    }
    jalankan();
    return () => { dibatalkan = true; if (scanner.current) scanner.current.stop().catch(() => undefined); };
  // Scanner dibuat sekali saat halaman dibuka.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function scanLagi() { setTerpindai(false); try { scanner.current?.resume(); } catch { window.location.reload(); } }
  return <div className="rounded-2xl bg-white p-4 shadow-soft sm:p-6"><div id="area-pemindai" className="overflow-hidden rounded-xl bg-stone-950" />{galat ? <div className="mt-4"><AlertMessage jenis="galat" pesan={galat} /></div> : <p className="mt-4 text-center text-sm text-stone-500">{mulai ? (memproses ? "Memvalidasi QR Code..." : "Arahkan QR Code ke kamera.") : "Menyiapkan kamera..."}</p>}{terpindai && !memproses && <div className="mt-4 text-center"><button onClick={scanLagi} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">Pindai Lagi</button></div>}</div>;
}
