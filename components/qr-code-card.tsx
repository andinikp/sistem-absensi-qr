"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Mahasiswa } from "@/lib/types";

const UKURAN_HALAMAN = { lebar: 419.53, tinggi: 595.28 };
const pengode = new TextEncoder();

function warna([merah, hijau, biru]: [number, number, number]) {
  return `${(merah / 255).toFixed(3)} ${(hijau / 255).toFixed(3)} ${(biru / 255).toFixed(3)}`;
}

function teksAman(teks: string) {
  return teks
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/([\\()])/g, "\\$1");
}

function dataUrlKeByte(dataUrl: string) {
  const data = atob(dataUrl.split(",")[1]);
  return Uint8Array.from(data, (karakter) => karakter.charCodeAt(0));
}

function gabungkanBagian(bagian: Uint8Array[]) {
  const hasil = new Uint8Array(bagian.reduce((total, item) => total + item.length, 0));
  let posisi = 0;
  bagian.forEach((item) => {
    hasil.set(item, posisi);
    posisi += item.length;
  });
  return hasil;
}

function buatPdfKartu(qrJpeg: string, mahasiswa: Mahasiswa) {
  const { lebar, tinggi } = UKURAN_HALAMAN;
  const isi: string[] = [];
  const xref: number[] = [];
  const bagian: Uint8Array[] = [pengode.encode("%PDF-1.3\n%âãÏÓ\n")];
  let panjang = bagian[0].length;
  const tambah = (konten: string | Uint8Array) => {
    const byte = typeof konten === "string" ? pengode.encode(konten) : konten;
    bagian.push(byte);
    panjang += byte.length;
  };
  const objek = (nomor: number, konten: string | Array<string | Uint8Array>) => {
    xref[nomor] = panjang;
    tambah(`${nomor} 0 obj\n`);
    if (Array.isArray(konten)) konten.forEach(tambah); else tambah(konten);
    tambah("\nendobj\n");
  };
  const kotak = (x: number, y: number, w: number, h: number, isiWarna: [number, number, number]) => {
    isi.push(`${warna(isiWarna)} rg ${x} ${(tinggi - y - h).toFixed(2)} ${w} ${h} re f`);
  };
  const garis = (x1: number, y1: number, x2: number, y2: number, garisWarna: [number, number, number]) => {
    isi.push(`${warna(garisWarna)} RG 0.6 w ${x1} ${(tinggi - y1).toFixed(2)} m ${x2} ${(tinggi - y2).toFixed(2)} l S`);
  };
  const tulis = (teks: string, x: number, y: number, ukuran: number, teksWarna: [number, number, number], tebal = false) => {
    // Helvetica bawaan PDF menjaga ukuran file tetap kecil dan cepat dibuat di browser.
    isi.push(`BT /F1 ${ukuran} Tf ${warna(teksWarna)} rg ${x} ${(tinggi - y).toFixed(2)} Td (${teksAman(teks)}) Tj ET`);
    if (tebal) isi.push("% label tebal");
  };

  kotak(0, 0, lebar, tinggi, [255, 249, 237]);
  kotak(0, 0, lebar, 118, [234, 88, 12]);
  kotak(34, 94, 351, 428, [255, 255, 255]);
  kotak(34, 94, 351, 4, [251, 146, 60]);

  tulis("SISTEM ABSENSI", 34, 35, 10, [255, 255, 255], true);
  tulis("KARTU QR MAHASISWA", 34, 59, 18, [255, 255, 255], true);
  tulis("Gunakan kartu ini untuk pencatatan kehadiran.", 34, 78, 8, [255, 255, 255]);
  tulis("NAMA MAHASISWA", 56, 126, 7, [120, 113, 108], true);
  tulis(mahasiswa.nama, 56, 145, 13, [41, 37, 36], true);

  kotak(100, 166, 220, 220, [255, 247, 237]);
  isi.push(`q 200 0 0 200 110 ${(tinggi - 176 - 200).toFixed(2)} cm /Im1 Do Q`);
  tulis("PINDAI UNTUK ABSENSI", 139, 402, 9, [154, 52, 18], true);

  const data = [
    ["NIM", mahasiswa.nim],
    ["PROGRAM STUDI", mahasiswa.prodi],
    ["ANGKATAN", mahasiswa.angkatan],
    ["KODE MAHASISWA", mahasiswa.kode_mahasiswa],
  ];
  let y = 430;
  data.forEach(([label, nilai], indeks) => {
    if (indeks > 0) garis(56, y - 10, 363, y - 10, [254, 215, 170]);
    tulis(label, 56, y, 7, [120, 113, 108], true);
    tulis(nilai, 196, y, 8, [41, 37, 36]);
    y += 19;
  });

  tulis("Simpan kartu ini dan tunjukkan QR Code saat melakukan absensi.", 69, 553, 7, [120, 113, 108]);
  tulis(`Kode verifikasi: ${mahasiswa.kode_mahasiswa}`, 137, 568, 7, [120, 113, 108]);

  const aliran = pengode.encode(isi.join("\n"));
  const gambar = dataUrlKeByte(qrJpeg);
  objek(1, "<< /Type /Catalog /Pages 2 0 R >>");
  objek(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  objek(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${lebar} ${tinggi}] /Resources << /Font << /F1 5 0 R >> /XObject << /Im1 6 0 R >> >> /Contents 4 0 R >>`);
  objek(4, [`<< /Length ${aliran.length} >>\nstream\n`, aliran, "\nendstream"]);
  objek(5, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objek(6, [`<< /Type /XObject /Subtype /Image /Width 1024 /Height 1024 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${gambar.length} >>\nstream\n`, gambar, "\nendstream"]);

  const awalXref = panjang;
  tambah("xref\n0 7\n0000000000 65535 f \n");
  for (let nomor = 1; nomor <= 6; nomor += 1) tambah(`${xref[nomor].toString().padStart(10, "0")} 00000 n \n`);
  tambah(`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${awalXref}\n%%EOF`);
  return new Blob([gabungkanBagian(bagian)], { type: "application/pdf" });
}

async function ubahQrMenjadiJpeg(svg: SVGElement) {
  const salinan = svg.cloneNode(true) as SVGElement;
  salinan.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  salinan.setAttribute("width", "900");
  salinan.setAttribute("height", "900");
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(salinan)], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const gambar = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("QR Code tidak dapat diproses."));
      img.src = url;
    });
    const kanvas = document.createElement("canvas");
    kanvas.width = 1024;
    kanvas.height = 1024;
    const konteks = kanvas.getContext("2d");
    if (!konteks) throw new Error("QR Code tidak dapat diproses.");
    konteks.fillStyle = "#FFFFFF";
    konteks.fillRect(0, 0, 1024, 1024);
    konteks.drawImage(gambar, 62, 62, 900, 900);
    return kanvas.toDataURL("image/jpeg", 0.98);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function QRCodeCard({ mahasiswa }: { mahasiswa: Mahasiswa }) {
  const [mengunduh, setMengunduh] = useState(false);

  function cetak() {
    window.print();
  }

  async function unduh() {
    const svg = document.querySelector<SVGSVGElement>("#kode-qr svg");
    if (!svg) return;
    setMengunduh(true);
    try {
      const blob = buatPdfKartu(await ubahQrMenjadiJpeg(svg), mahasiswa);
      const url = URL.createObjectURL(blob);
      const tautan = document.createElement("a");
      tautan.href = url;
      tautan.download = `Kartu-QR-${mahasiswa.kode_mahasiswa}.pdf`;
      tautan.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal membuat PDF QR Code", error);
      window.alert("PDF QR Code gagal dibuat. Silakan coba lagi.");
    } finally {
      setMengunduh(false);
    }
  }

  return <section className="mx-auto max-w-md rounded-3xl bg-white p-6 text-center shadow-soft sm:p-8"><div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-orange-500 text-2xl text-white">▣</div><h2 className="text-xl font-bold text-stone-900">Kartu QR Mahasiswa</h2><p className="mt-1 text-sm text-stone-500">Tunjukkan QR Code ini saat absensi.</p><div id="kode-qr" className="mx-auto my-7 inline-block rounded-2xl border-8 border-orange-50 bg-white p-3"><QRCode value={mahasiswa.kode_mahasiswa} size={220} level="M" /></div><dl className="space-y-3 rounded-2xl bg-cream p-4 text-left text-sm"><Info label="Nama" nilai={mahasiswa.nama} /><Info label="NIM" nilai={mahasiswa.nim} /><Info label="Program Studi" nilai={mahasiswa.prodi} /><Info label="Angkatan" nilai={mahasiswa.angkatan} /><Info label="Kode Mahasiswa" nilai={mahasiswa.kode_mahasiswa} /></dl><div className="no-print mt-6 flex flex-wrap justify-center gap-3"><button onClick={cetak} className="rounded-xl border border-orange-200 px-4 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-50">Cetak QR Code</button><button onClick={unduh} disabled={mengunduh} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-wait disabled:bg-orange-300">{mengunduh ? "Menyiapkan PDF..." : "Unduh Kartu PDF"}</button></div></section>;
}

function Info({ label, nilai }: { label: string; nilai: string }) { return <div className="flex justify-between gap-4 border-b border-orange-100 pb-2 last:border-0 last:pb-0"><dt className="text-stone-500">{label}</dt><dd className="text-right font-semibold text-stone-800">{nilai}</dd></div>; }
