import { AbsensiDenganMahasiswa, AbsensiQuery, Mahasiswa, MahasiswaQuery, Prodi, Angkatan, STATUS_ABSENSI, StatusAbsensi } from "./types";

function ambilRelasi<T>(nilai: T | T[] | null | undefined) {
  if (Array.isArray(nilai)) return nilai[0] ?? null;
  return nilai ?? null;
}

function statusAbsensi(nilai: string): StatusAbsensi {
  return STATUS_ABSENSI.includes(nilai as StatusAbsensi) ? (nilai as StatusAbsensi) : "Hadir";
}

export function normalisasiMahasiswa(row: MahasiswaQuery): Mahasiswa {
  const dataProdi = ambilRelasi<Prodi>(row.data_prodi);
  const dataAngkatan = ambilRelasi<Angkatan>(row.data_angkatan);

  return {
    id: row.id,
    nama: row.nama,
    nim: row.nim,
    prodi_id: row.prodi_id ?? dataProdi?.id ?? "",
    angkatan_id: row.angkatan_id ?? dataAngkatan?.id ?? "",
    prodi: dataProdi?.nama_prodi ?? row.prodi ?? "-",
    angkatan: dataAngkatan?.tahun ?? row.angkatan ?? "-",
    kode_mahasiswa: row.kode_mahasiswa,
    qr_code: row.qr_code,
    created_at: row.created_at,
    data_prodi: dataProdi,
    data_angkatan: dataAngkatan,
  };
}

export function normalisasiAbsensi(row: AbsensiQuery): AbsensiDenganMahasiswa {
  const mahasiswaRow = ambilRelasi<MahasiswaQuery>(row.mahasiswa);
  const mahasiswa = mahasiswaRow ? normalisasiMahasiswa(mahasiswaRow) : null;

  return {
    id: row.id,
    mahasiswa_id: row.mahasiswa_id,
    kode_mahasiswa: row.kode_mahasiswa,
    tanggal: row.tanggal,
    jam_masuk: row.jam_masuk,
    status: statusAbsensi(row.status),
    created_at: row.created_at,
    mahasiswa: mahasiswa
      ? {
          id: mahasiswa.id,
          nama: mahasiswa.nama,
          nim: mahasiswa.nim,
          prodi: mahasiswa.prodi,
          angkatan: mahasiswa.angkatan,
          prodi_id: mahasiswa.prodi_id,
          angkatan_id: mahasiswa.angkatan_id,
        }
      : null,
  };
}
