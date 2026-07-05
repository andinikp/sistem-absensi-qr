import MasterDataCrud from "@/components/master-data-crud";

export default function MasterProdiPage() {
  return (
    <MasterDataCrud
      tabel="prodi"
      kolom="nama_prodi"
      judul="Master Prodi"
      deskripsi="Kelola daftar program studi untuk dropdown mahasiswa, filter, dashboard, dan rekap."
      labelInput="Nama Prodi"
      placeholder="Contoh: Teknik Informatika"
      tombolTambah="Tambah Prodi"
      labelCari="Cari Nama Prodi"
      placeholderCari="Ketik nama prodi..."
      judulKolom="Nama Prodi"
    />
  );
}
