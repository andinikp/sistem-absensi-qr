-- SISTEM ABSENSI QR CODE MAHASISWA
-- Jalankan seluruh skrip ini melalui Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.mahasiswa (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  nim text not null unique,
  prodi text not null,
  angkatan text not null,
  kode_mahasiswa text not null unique,
  qr_code text,
  created_at timestamp with time zone default now()
);

create table if not exists public.absensi (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.mahasiswa(id) on delete cascade,
  kode_mahasiswa text not null,
  tanggal date not null,
  jam_masuk time not null,
  status text not null default 'Hadir',
  created_at timestamp with time zone default now(),
  constraint absensi_mahasiswa_tanggal_unik unique (mahasiswa_id, tanggal)
);

create index if not exists mahasiswa_nama_idx on public.mahasiswa using btree (nama);
create index if not exists absensi_tanggal_idx on public.absensi using btree (tanggal desc);

-- RLS aman untuk proyek ini: data hanya bisa diakses pengguna yang sudah login
-- melalui Supabase Auth. Jangan gunakan policy ini untuk produksi tanpa evaluasi role admin.
alter table public.mahasiswa enable row level security;
alter table public.absensi enable row level security;

drop policy if exists "Admin login dapat mengelola mahasiswa" on public.mahasiswa;
create policy "Admin login dapat mengelola mahasiswa" on public.mahasiswa
  for all to authenticated using (true) with check (true);

drop policy if exists "Admin login dapat mengelola absensi" on public.absensi;
create policy "Admin login dapat mengelola absensi" on public.absensi
  for all to authenticated using (true) with check (true);

-- PENGEMBANGAN LOKAL SAJA (opsional, jangan aktif di produksi):
-- alter table public.mahasiswa disable row level security;
-- alter table public.absensi disable row level security;
