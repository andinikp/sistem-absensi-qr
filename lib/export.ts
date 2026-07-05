import { AbsensiDenganMahasiswa } from "./types";
import { formatTanggal } from "./utils";

function amanHtml(nilai: string) {
  return nilai
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function namaFile(prefix: string, ekstensi: string) {
  const tanggal = new Date().toISOString().slice(0, 10);
  return `${prefix}-${tanggal}.${ekstensi}`;
}

function barisRekap(data: AbsensiDenganMahasiswa[]) {
  return data
    .map((item, index) => {
      const mahasiswa = item.mahasiswa;
      const jamMasuk = item.jam_masuk ? item.jam_masuk.slice(0, 5) : "-";
      return `<tr>
        <td>${index + 1}</td>
        <td>${amanHtml(mahasiswa?.nama ?? "Mahasiswa dihapus")}</td>
        <td>${amanHtml(mahasiswa?.nim ?? "-")}</td>
        <td>${amanHtml(mahasiswa?.prodi ?? "-")}</td>
        <td>${amanHtml(mahasiswa?.angkatan ?? "-")}</td>
        <td>${amanHtml(formatTanggal(item.tanggal))}</td>
        <td>${amanHtml(jamMasuk)}</td>
        <td>${amanHtml(item.status)}</td>
      </tr>`;
    })
    .join("");
}

export function exportRekapExcel(data: AbsensiDenganMahasiswa[]) {
  const tabel = `<!doctype html><html><head><meta charset="utf-8" /></head><body>
    <table border="1">
      <thead><tr><th>No</th><th>Nama</th><th>NIM</th><th>Prodi</th><th>Angkatan</th><th>Tanggal</th><th>Jam Masuk</th><th>Status</th></tr></thead>
      <tbody>${barisRekap(data)}</tbody>
    </table>
  </body></html>`;
  const blob = new Blob([tabel], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = namaFile("rekap-absensi", "xls");
  tautan.click();
  URL.revokeObjectURL(url);
}

export function exportRekapPdf(data: AbsensiDenganMahasiswa[]) {
  const jendela = window.open("", "_blank", "width=1200,height=800");
  if (!jendela) {
    window.alert("Jendela cetak tidak dapat dibuka. Izinkan popup untuk mengunduh PDF.");
    return;
  }

  jendela.document.write(`<!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>Rekap Absensi</title>
        <style>
          body { font-family: Arial, sans-serif; color: #292524; margin: 32px; }
          h1 { margin: 0 0 6px; font-size: 24px; }
          p { margin: 0 0 20px; color: #78716c; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #ffedd5; color: #9a3412; text-align: left; }
          th, td { border: 1px solid #fed7aa; padding: 8px; }
          @media print { body { margin: 18mm; } }
        </style>
      </head>
      <body>
        <h1>Rekap Absensi</h1>
        <p>Total data: ${data.length}</p>
        <table>
          <thead><tr><th>No</th><th>Nama</th><th>NIM</th><th>Prodi</th><th>Angkatan</th><th>Tanggal</th><th>Jam Masuk</th><th>Status</th></tr></thead>
          <tbody>${barisRekap(data)}</tbody>
        </table>
      </body>
    </html>`);
  jendela.document.close();
  jendela.focus();
  jendela.print();
}
