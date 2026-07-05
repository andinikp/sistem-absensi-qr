# Sistem Absensi QR Code Mahasiswa

Aplikasi web untuk admin kampus yang mengelola data mahasiswa dan mencatat kehadiran dengan QR Code. Antarmuka seluruhnya menggunakan Bahasa Indonesia, responsif, dan memakai tema edukasi oranye-kuning.

## Tujuan dan Teknologi

Tujuan aplikasi ini adalah mempercepat absensi mahasiswa, mengurangi kesalahan pencatatan manual, menjaga data master lebih rapi, dan menyediakan rekap kehadiran yang mudah difilter serta diexport.

Teknologi yang digunakan:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- `html5-qrcode`
- `react-qr-code`
- Browser Speech Synthesis API
- Vercel

## Fitur Utama

- Login admin dengan Supabase Auth.
- Dashboard statistik: Total Mahasiswa, Total Prodi, Total Angkatan, Hadir Hari Ini, Tidak Hadir, Izin, dan Sakit.
- Chart ringkas absensi per Prodi dan per Angkatan.
- CRUD Master Prodi.
- CRUD Master Angkatan.
- CRUD Data Mahasiswa dengan dropdown Prodi dan Angkatan otomatis dari tabel master.
- QR Code mahasiswa otomatis berdasarkan `MHS-{NIM}`.
- Scan absensi memakai kamera browser.
- Pencegahan absensi ganda per mahasiswa per tanggal.
- Voice notification saat absensi berhasil, duplikat, QR tidak valid, dan error database.
- Rekap absensi dengan filter Tanggal, Prodi, Angkatan, Status, Nama, dan NIM.
- Edit status absensi: Hadir, Tidak Hadir, Izin, Sakit.
- Generate Tidak Hadir untuk mahasiswa yang belum absen pada hari berjalan.
- Export rekap ke PDF dan Excel.

## Metode Pengembangan Waterfall

1. **Analisis kebutuhan:** ditetapkan alur admin, master data, mahasiswa, QR Code, scan absensi, status kehadiran, dan rekap.
2. **Desain sistem:** dibuat rancangan tabel `prodi`, `angkatan`, `mahasiswa`, dan `absensi`, termasuk relasi foreign key.
3. **Implementasi:** halaman dan komponen dibuat di folder `app/`, `components/`, `hooks/`, dan `lib/`.
4. **Pengujian:** gunakan skenario pada bagian Pengujian untuk mengecek fitur utama.
5. **Pemeliharaan:** update policy RLS, migrasi database, dependensi, dan role admin bila kebutuhan produksi berkembang.

## Struktur Folder

```text
.
|-- app/
|   |-- (admin)/
|   |   |-- dashboard/
|   |   |-- data-mahasiswa/
|   |   |   |-- tambah/
|   |   |   `-- [id]/
|   |   |       |-- edit/
|   |   |       `-- qr/
|   |   |-- master-angkatan/
|   |   |-- master-prodi/
|   |   |-- rekap-absensi/
|   |   `-- scan-absensi/
|   |-- login/
|   |-- globals.css
|   `-- layout.tsx
|-- components/
|-- hooks/
|-- lib/
|-- supabase/
|   |-- migrations/
|   `-- schema.sql
|-- .env.example
|-- package.json
`-- README.md
```

## Skema Database

Tabel utama:

- `prodi`: menyimpan master program studi.
- `angkatan`: menyimpan master tahun angkatan.
- `mahasiswa`: menyimpan data mahasiswa dan relasi ke `prodi` serta `angkatan`.
- `absensi`: menyimpan data kehadiran mahasiswa.

Relasi penting:

- `mahasiswa.prodi_id` mengarah ke `prodi.id`.
- `mahasiswa.angkatan_id` mengarah ke `angkatan.id`.
- `absensi.mahasiswa_id` mengarah ke `mahasiswa.id`.
- `absensi` memiliki unique constraint `(mahasiswa_id, tanggal)` untuk mencegah duplikasi absensi harian.

Status absensi yang didukung:

- `Hadir`
- `Tidak Hadir`
- `Izin`
- `Sakit`

## Menyiapkan Supabase untuk Instalasi Baru

1. Buat project baru di Supabase.
2. Buka **SQL Editor**.
3. Salin seluruh isi [`supabase/schema.sql`](supabase/schema.sql), lalu jalankan.
4. Buka **Authentication > Users**, lalu tambahkan akun admin.
5. Salin `.env.example` menjadi `.env.local`.
6. Isi variabel berikut dari **Project Settings > API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://namaproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_key_anda
```

Jangan memasukkan `service_role key` ke frontend atau menyimpannya di repositori.

## Migrasi dari Database Lama

Jika database lama masih memiliki kolom teks `mahasiswa.prodi` dan `mahasiswa.angkatan`, jalankan file migrasi berikut melalui Supabase SQL Editor:

```text
supabase/migrations/20260705_master_prodi_angkatan_absensi.sql
```

Migrasi ini akan:

- Membuat tabel `prodi` dan `angkatan`.
- Menyalin nilai unik dari kolom teks lama ke tabel master.
- Mengisi `mahasiswa.prodi_id` dan `mahasiswa.angkatan_id`.
- Membuat foreign key.
- Menghapus kolom teks lama `prodi` dan `angkatan`.
- Mengizinkan `absensi.jam_masuk` bernilai kosong untuk status `Tidak Hadir`.
- Menambahkan validasi status absensi.
- Mengaktifkan RLS dan policy untuk user authenticated.

## Instalasi dan Menjalankan Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`, lalu masuk menggunakan akun admin yang sudah dibuat di Supabase Auth.

Untuk build produksi:

```bash
npm run build
```

## Alur Sistem

Admin login, lalu mengisi Master Prodi dan Master Angkatan. Setelah itu admin menambahkan mahasiswa dengan memilih Prodi dan Angkatan dari dropdown. Sistem membuat kode mahasiswa otomatis dalam format `MHS-{NIM}` dan menampilkan QR Code.

Saat QR Code dipindai, aplikasi mencari `kode_mahasiswa`, memeriksa absensi pada tanggal hari ini berdasarkan waktu WIB, lalu menyimpan status `Hadir` jika belum ada data. Jika mahasiswa sudah absen, aplikasi menolak duplikasi. Rekap absensi dapat difilter, statusnya dapat diedit, dan data dapat diexport ke PDF atau Excel.

Isi QR hanya `kode_mahasiswa`, misalnya `MHS-20241001`; data pribadi mahasiswa tidak dimasukkan ke QR Code.

## Generate Tidak Hadir

Fitur ini berada di halaman Rekap Absensi. Saat tombol **Generate Tidak Hadir** ditekan, sistem akan:

1. Memuat semua mahasiswa.
2. Memuat data absensi hari ini.
3. Membandingkan mahasiswa yang sudah dan belum memiliki absensi.
4. Membuat data absensi baru dengan status `Tidak Hadir` untuk mahasiswa yang belum absen.
5. Mencegah duplikasi dengan constraint `(mahasiswa_id, tanggal)`.

## Voice Notification

Voice notification memakai Browser Speech Synthesis API dengan bahasa `id-ID`. Tidak ada API eksternal atau layanan berbayar.

Event suara:

- Absensi berhasil: `Selamat datang, {Nama Mahasiswa}. Absensi berhasil.`
- Absensi duplikat: `Anda sudah melakukan absensi hari ini.`
- QR tidak valid: `QR Code tidak valid.`
- Error database: `Gagal menyimpan absensi.`

Helper berada di [`lib/voice.ts`](lib/voice.ts):

- `playVoice()`
- `stopVoice()`

## Pengujian

1. **Login admin berhasil:** gunakan akun Supabase Auth dan pastikan Dashboard terbuka.
2. **Login admin gagal:** gunakan password salah dan pastikan pesan error tampil.
3. **Master Prodi:** tambah, edit, cari, dan hapus Prodi yang belum dipakai mahasiswa.
4. **Master Angkatan:** tambah, edit, cari, dan hapus Angkatan yang belum dipakai mahasiswa.
5. **Tambah mahasiswa:** pastikan Prodi dan Angkatan tampil sebagai dropdown, bukan input manual.
6. **Edit mahasiswa:** ubah Prodi atau Angkatan dan pastikan tabel menampilkan nama relasi terbaru.
7. **QR Code:** klik **Lihat QR**, pastikan QR tampil, dapat dicetak, dan dapat diunduh.
8. **Scan valid:** pindai QR mahasiswa dan pastikan status `Hadir` tersimpan.
9. **Scan duplikat:** pindai QR yang sama pada tanggal yang sama dan pastikan data tidak bertambah.
10. **QR tidak valid:** pindai QR dengan nilai lain dan pastikan pesan `QR Code tidak valid.` tampil.
11. **Voice:** pastikan suara berjalan pada absensi berhasil, duplikat, QR invalid, dan error.
12. **Rekap:** uji filter Tanggal, Prodi, Angkatan, Status, Nama, dan NIM.
13. **Edit status:** ubah status menjadi `Izin`, `Sakit`, atau `Tidak Hadir`, lalu pastikan tersimpan.
14. **Generate Tidak Hadir:** jalankan fitur ini dan pastikan mahasiswa tanpa absensi hari ini dibuatkan status `Tidak Hadir`.
15. **Export:** export rekap ke PDF dan Excel.
16. **Dashboard:** pastikan kartu statistik dan chart mengikuti data absensi terbaru.

Untuk kamera, gunakan `localhost` saat pengembangan atau situs HTTPS setelah deployment. Pada ponsel, gunakan kamera belakang dan pastikan QR cukup terang serta fokus.

## Deployment Vercel

1. Unggah proyek ke GitHub, GitLab, atau Bitbucket.
2. Buat project baru di Vercel dan impor repositori.
3. Tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` pada **Settings > Environment Variables**.
4. Deploy. Vercel otomatis mengenali Next.js.
5. Tambahkan URL deployment Vercel di **Supabase > Authentication > URL Configuration** bila konfigurasi auth project memerlukannya.

## Troubleshooting

- **Supabase belum diatur:** cek `.env.local`, lalu hentikan dan jalankan ulang `npm run dev`.
- **Data master tidak muncul:** jalankan `supabase/schema.sql` untuk instalasi baru atau file migrasi untuk database lama.
- **Data mahasiswa gagal dimuat:** pastikan kolom `prodi_id` dan `angkatan_id` sudah tersedia dan foreign key sudah dibuat.
- **Tidak bisa hapus Prodi/Angkatan:** data tersebut masih digunakan oleh mahasiswa. Ubah data mahasiswa terlebih dahulu.
- **Login selalu gagal:** pastikan user dibuat di Supabase Auth dan URL/key Supabase benar.
- **Kamera tidak dapat diakses:** izinkan akses kamera, gunakan HTTPS/localhost, dan tutup aplikasi lain yang memakai kamera.
- **Voice tidak terdengar:** pastikan browser mendukung Speech Synthesis dan volume perangkat aktif.
- **Duplikasi absensi:** ini perilaku yang diharapkan; constraint `(mahasiswa_id, tanggal)` menjaga data tetap satu kali per hari.
