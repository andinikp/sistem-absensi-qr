export const SELECT_MAHASISWA_DENGAN_MASTER =
  "id, nama, nim, prodi_id, angkatan_id, kode_mahasiswa, qr_code, created_at, data_prodi:prodi(id, nama_prodi, created_at), data_angkatan:angkatan(id, tahun, created_at)";

export const SELECT_ABSENSI_DENGAN_MAHASISWA =
  "id, mahasiswa_id, kode_mahasiswa, tanggal, jam_masuk, status, created_at, mahasiswa(id, nama, nim, prodi_id, angkatan_id, kode_mahasiswa, qr_code, created_at, data_prodi:prodi(id, nama_prodi, created_at), data_angkatan:angkatan(id, tahun, created_at))";
