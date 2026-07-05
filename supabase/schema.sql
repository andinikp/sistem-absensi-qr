-- SISTEM ABSENSI QR CODE MAHASISWA
-- Jalankan seluruh skrip ini melalui Supabase SQL Editor untuk instalasi baru.
-- Untuk database lama, jalankan juga file supabase/migrations/20260705_master_prodi_angkatan_absensi.sql.

create extension if not exists "pgcrypto";

create table if not exists public.prodi (
  id uuid primary key default gen_random_uuid(),
  nama_prodi text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.angkatan (
  id uuid primary key default gen_random_uuid(),
  tahun text not null,
  created_at timestamp with time zone default now()
);

create unique index if not exists prodi_nama_prodi_unik on public.prodi (lower(nama_prodi));
create unique index if not exists angkatan_tahun_unik on public.angkatan (tahun);

create table if not exists public.mahasiswa (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  nim text not null unique,
  prodi_id uuid not null references public.prodi(id) on update cascade on delete restrict,
  angkatan_id uuid not null references public.angkatan(id) on update cascade on delete restrict,
  kode_mahasiswa text not null unique,
  qr_code text,
  created_at timestamp with time zone default now()
);

create table if not exists public.absensi (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.mahasiswa(id) on delete cascade,
  kode_mahasiswa text not null,
  tanggal date not null,
  jam_masuk time,
  status text not null default 'Hadir',
  created_at timestamp with time zone default now(),
  constraint absensi_status_valid check (status in ('Hadir', 'Tidak Hadir', 'Izin', 'Sakit')),
  constraint absensi_mahasiswa_tanggal_unik unique (mahasiswa_id, tanggal)
);

create index if not exists mahasiswa_nama_idx on public.mahasiswa using btree (nama);
create index if not exists mahasiswa_prodi_id_idx on public.mahasiswa using btree (prodi_id);
create index if not exists mahasiswa_angkatan_id_idx on public.mahasiswa using btree (angkatan_id);
create index if not exists absensi_tanggal_idx on public.absensi using btree (tanggal desc);
create index if not exists absensi_status_idx on public.absensi using btree (status);

-- RLS aman untuk proyek ini: data hanya bisa diakses pengguna yang sudah login
-- melalui Supabase Auth. Jangan gunakan policy ini untuk produksi tanpa evaluasi role admin.
alter table public.prodi enable row level security;
alter table public.angkatan enable row level security;
alter table public.mahasiswa enable row level security;
alter table public.absensi enable row level security;

drop policy if exists "Admin login dapat mengelola prodi" on public.prodi;
create policy "Admin login dapat mengelola prodi" on public.prodi
  for all to authenticated using (true) with check (true);

drop policy if exists "Admin login dapat mengelola angkatan" on public.angkatan;
create policy "Admin login dapat mengelola angkatan" on public.angkatan
  for all to authenticated using (true) with check (true);

drop policy if exists "Admin login dapat mengelola mahasiswa" on public.mahasiswa;
create policy "Admin login dapat mengelola mahasiswa" on public.mahasiswa
  for all to authenticated using (true) with check (true);

drop policy if exists "Admin login dapat mengelola absensi" on public.absensi;
create policy "Admin login dapat mengelola absensi" on public.absensi
  for all to authenticated using (true) with check (true);

-- PENGEMBANGAN LOKAL SAJA (opsional, jangan aktif di produksi):
-- alter table public.prodi disable row level security;
-- alter table public.angkatan disable row level security;
-- alter table public.mahasiswa disable row level security;
-- alter table public.absensi disable row level security;
