# Sistem Absensi QR Code Mahasiswa

Aplikasi web untuk admin kampus yang mengelola data mahasiswa dan mencatat kehadiran dengan QR Code. Antarmuka seluruhnya menggunakan bahasa Indonesia dan dirancang responsif dengan tema oranye-kuning.

## Tujuan dan teknologi

Tujuannya adalah mempercepat absensi, mengurangi kesalahan pencatatan manual, dan menyediakan rekap kehadiran yang mudah difilter. Proyek memakai Next.js App Router, TypeScript, Tailwind CSS, Supabase Database, Supabase Auth, `react-qr-code`, dan `html5-qrcode`.

## Metode pengembangan Waterfall

1. **Analisis kebutuhan:** ditetapkan peran admin/mahasiswa, data mahasiswa, validasi QR, dan pencegahan absensi ganda.
2. **Desain sistem:** dibuat rancangan tabel `mahasiswa` dan `absensi`, alur login, navigasi, serta UI responsif.
3. **Implementasi:** halaman dan komponen di folder `app/`, `components/`, serta koneksi Supabase di `lib/`.
4. **Pengujian:** gunakan skenario pada bagian Pengujian untuk mengecek tiap fitur.
5. **Pemeliharaan:** perbarui policy RLS, dependensi, dan tambahkan fitur laporan/role bila kebutuhan berkembang.

## Struktur folder

```text
.
├── app/
│   ├── (admin)/                 # Halaman yang memerlukan sesi admin
│   │   ├── dashboard/
│   │   ├── data-mahasiswa/
│   │   │   ├── tambah/
│   │   │   └── [id]/{edit,qr}/
│   │   ├── scan-absensi/
│   │   └── rekap-absensi/
│   ├── login/
│   ├── globals.css
│   └── layout.tsx
├── components/                  # Komponen UI yang dapat digunakan ulang
├── lib/                         # Klien Supabase, tipe data, utilitas
├── supabase/schema.sql           # Skema dan RLS Supabase
├── .env.example
└── package.json
```

## Menyiapkan Supabase

1. Buat project baru di [Supabase](https://supabase.com), lalu buka **SQL Editor**.
2. Salin seluruh isi [`supabase/schema.sql`](supabase/schema.sql) dan jalankan.
3. Di **Authentication > Users**, tambahkan pengguna admin dengan email dan password. Aplikasi memakai Supabase Auth; password tidak pernah disimpan di tabel sendiri.
4. Salin `.env.example` menjadi `.env.local`, lalu isi variabel berikut dari **Project Settings > API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://namaproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_key_anda
```

Jangan pernah memasukkan `service_role key` ke `.env.local` frontend atau menyimpannya di repositori. RLS di SQL mengizinkan seluruh pengguna **authenticated** untuk mengelola data agar mudah untuk tugas kuliah. Untuk produksi, ganti dengan policy yang memeriksa role admin (misalnya custom claim) dan jangan menonaktifkan RLS. Dua perintah `disable row level security` hanya disediakan sebagai komentar untuk diagnosis lokal sementara.

## Instalasi dan menjalankan lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000), lalu masuk menggunakan akun admin yang dibuat di Supabase. Untuk membuat proyek dari nol dengan generator, perintah ekuivalennya adalah `npx create-next-app@latest sistem-absensi-qr`, kemudian salin kode proyek ini dan jalankan `npm install @supabase/supabase-js react-qr-code html5-qrcode`.

## Alur sistem

Admin login → menambah mahasiswa → sistem membuat `MHS-{NIM}` → halaman QR menampilkan kode tersebut → admin memindai kode → aplikasi mencari `kode_mahasiswa` → memeriksa absensi pada tanggal WIB hari ini → menyimpan status **Hadir** atau menolak duplikasi → rekap menampilkan data dan filter.

Isi QR hanya `kode_mahasiswa`, misalnya `MHS-20241001`; data pribadi mahasiswa tidak dimasukkan ke QR Code.

## Pengujian

1. **Login admin berhasil:** gunakan akun yang ada di Supabase Auth dan pastikan Dashboard terbuka.
2. **Login admin gagal:** gunakan password salah; pesan “Login gagal. Periksa email dan password.” tampil.
3. **Tambah mahasiswa:** simpan form lengkap dan pastikan data muncul di tabel.
4. **Kode otomatis:** masukkan NIM `20241001`; pastikan kode menjadi `MHS-20241001`.
5. **QR Code:** klik **Lihat QR**, periksa bahwa QR tampak, dapat dicetak, dan dapat diunduh.
6. **Pemindaian valid:** buka QR di perangkat/layar lain, izinkan kamera, lalu pindai; pesan “Absensi berhasil disimpan.” tampil.
7. **QR tidak valid:** pindai QR dengan nilai lain; pastikan pesan “QR Code tidak valid.” tampil.
8. **Duplikasi:** pindai QR yang sama lagi pada tanggal yang sama; pastikan pesan duplikasi tampil dan baris tidak bertambah.
9. **Rekap:** buka Rekap Absensi dan pastikan catatan baru ditampilkan dengan status Hadir.
10. **Filter:** uji tanggal, prodi, angkatan, nama, serta NIM dan pastikan hasil berubah sesuai filter.

Untuk kamera, gunakan `localhost` saat pengembangan atau situs HTTPS setelah deployment. Browser desktop sering meminta izin kamera; pada ponsel, gunakan kamera belakang dan pastikan QR cukup terang/fokus.

## Deployment Vercel

1. Unggah proyek ke GitHub/GitLab/Bitbucket.
2. Buat project baru di [Vercel](https://vercel.com) dan impor repositori.
3. Tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` pada **Settings > Environment Variables**.
4. Deploy. Vercel otomatis mengenali Next.js; tidak diperlukan konfigurasi build khusus.
5. Tambahkan URL deployment Vercel di **Supabase > Authentication > URL Configuration** bila pengaturan redirect/auth di project Anda memerlukannya.

## Troubleshooting

- **“Supabase belum diatur”:** cek nama variabel `.env.local`, lalu hentikan dan jalankan kembali `npm run dev`.
- **Data kosong/gagal dimuat:** jalankan ulang `supabase/schema.sql`, lalu periksa bahwa user sudah login dan RLS policy aktif.
- **Login selalu gagal:** pastikan pengguna dibuat di Supabase Auth, email sudah dikonfirmasi bila konfirmasi email dinyalakan, dan URL/key tepat.
- **Kamera tidak dapat diakses:** izinkan kamera di browser, gunakan HTTPS/localhost, tutup aplikasi lain yang memakai kamera, atau coba browser lain.
- **Duplikasi absensi:** ini perilaku yang diharapkan; constraint `unique(mahasiswa_id, tanggal)` menjaga data tetap satu kali per hari.
