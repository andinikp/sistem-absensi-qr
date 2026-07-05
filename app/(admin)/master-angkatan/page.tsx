import MasterDataCrud from "@/components/master-data-crud";

export default function MasterAngkatanPage() {
  return (
    <MasterDataCrud
      tabel="angkatan"
      kolom="tahun"
      judul="Master Angkatan"
      deskripsi="Kelola daftar angkatan untuk dropdown mahasiswa, filter, dashboard, dan rekap."
      labelInput="Tahun Angkatan"
      placeholder="Contoh: 2024"
      tombolTambah="Tambah Angkatan"
      labelCari="Cari Angkatan"
      placeholderCari="Ketik tahun angkatan..."
      judulKolom="Tahun"
      inputMode="numeric"
    />
  );
}
