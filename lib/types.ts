export type Mahasiswa = {
  id: string;
  nama: string;
  nim: string;
  prodi: string;
  angkatan: string;
  kode_mahasiswa: string;
  qr_code: string | null;
  created_at: string;
};

export type Absensi = {
  id: string;
  mahasiswa_id: string;
  kode_mahasiswa: string;
  tanggal: string;
  jam_masuk: string;
  status: string;
  created_at: string;
};

export type AbsensiDenganMahasiswa = Absensi & { mahasiswa: Pick<Mahasiswa, "nama" | "nim" | "prodi" | "angkatan"> | null };
