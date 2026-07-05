export type Prodi = {
  id: string;
  nama_prodi: string;
  created_at: string;
};

export type Angkatan = {
  id: string;
  tahun: string;
  created_at: string;
};

export const STATUS_ABSENSI = ["Hadir", "Tidak Hadir", "Izin", "Sakit"] as const;

export type StatusAbsensi = (typeof STATUS_ABSENSI)[number];

export type Mahasiswa = {
  id: string;
  nama: string;
  nim: string;
  prodi_id: string;
  angkatan_id: string;
  prodi: string;
  angkatan: string;
  kode_mahasiswa: string;
  qr_code: string | null;
  created_at: string;
  data_prodi?: Prodi | null;
  data_angkatan?: Angkatan | null;
};

export type MahasiswaQuery = {
  id: string;
  nama: string;
  nim: string;
  prodi_id: string | null;
  angkatan_id: string | null;
  kode_mahasiswa: string;
  qr_code: string | null;
  created_at: string;
  prodi?: string | null;
  angkatan?: string | null;
  data_prodi?: Prodi | Prodi[] | null;
  data_angkatan?: Angkatan | Angkatan[] | null;
};

export type Absensi = {
  id: string;
  mahasiswa_id: string;
  kode_mahasiswa: string;
  tanggal: string;
  jam_masuk: string | null;
  status: StatusAbsensi;
  created_at: string;
};

export type AbsensiQuery = Omit<Absensi, "status"> & {
  status: string;
  mahasiswa?: MahasiswaQuery | MahasiswaQuery[] | null;
};

export type AbsensiDenganMahasiswa = Absensi & {
  mahasiswa: Pick<Mahasiswa, "id" | "nama" | "nim" | "prodi" | "angkatan" | "prodi_id" | "angkatan_id"> | null;
};
