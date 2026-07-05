-- MIGRASI MASTER PRODI, MASTER ANGKATAN, DAN STATUS ABSENSI
-- Jalankan file ini pada database lama yang sebelumnya menyimpan prodi dan angkatan
-- sebagai teks di tabel mahasiswa.

begin;

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

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mahasiswa' and column_name = 'prodi'
  ) then
    execute $sql$
      insert into public.prodi (nama_prodi)
      select distinct btrim(prodi)
      from public.mahasiswa
      where prodi is not null and btrim(prodi) <> ''
      on conflict do nothing
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mahasiswa' and column_name = 'angkatan'
  ) then
    execute $sql$
      insert into public.angkatan (tahun)
      select distinct btrim(angkatan)
      from public.mahasiswa
      where angkatan is not null and btrim(angkatan) <> ''
      on conflict do nothing
    $sql$;
  end if;
end $$;

alter table public.mahasiswa add column if not exists prodi_id uuid;
alter table public.mahasiswa add column if not exists angkatan_id uuid;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mahasiswa' and column_name = 'prodi'
  ) then
    execute $sql$
      update public.mahasiswa m
      set prodi_id = p.id
      from public.prodi p
      where m.prodi_id is null
        and lower(btrim(m.prodi)) = lower(btrim(p.nama_prodi))
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mahasiswa' and column_name = 'angkatan'
  ) then
    execute $sql$
      update public.mahasiswa m
      set angkatan_id = a.id
      from public.angkatan a
      where m.angkatan_id is null
        and btrim(m.angkatan) = btrim(a.tahun)
    $sql$;
  end if;
end $$;

insert into public.prodi (nama_prodi)
select 'Belum Ditentukan'
where exists (select 1 from public.mahasiswa where prodi_id is null)
  and not exists (select 1 from public.prodi where lower(nama_prodi) = lower('Belum Ditentukan'));

insert into public.angkatan (tahun)
select 'Tidak Diketahui'
where exists (select 1 from public.mahasiswa where angkatan_id is null)
  and not exists (select 1 from public.angkatan where tahun = 'Tidak Diketahui');

update public.mahasiswa
set prodi_id = (select id from public.prodi where lower(nama_prodi) = lower('Belum Ditentukan') limit 1)
where prodi_id is null;

update public.mahasiswa
set angkatan_id = (select id from public.angkatan where tahun = 'Tidak Diketahui' limit 1)
where angkatan_id is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'mahasiswa_prodi_id_fkey') then
    alter table public.mahasiswa
      add constraint mahasiswa_prodi_id_fkey
      foreign key (prodi_id) references public.prodi(id)
      on update cascade on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'mahasiswa_angkatan_id_fkey') then
    alter table public.mahasiswa
      add constraint mahasiswa_angkatan_id_fkey
      foreign key (angkatan_id) references public.angkatan(id)
      on update cascade on delete restrict;
  end if;
end $$;

alter table public.mahasiswa alter column prodi_id set not null;
alter table public.mahasiswa alter column angkatan_id set not null;

alter table public.mahasiswa drop column if exists prodi;
alter table public.mahasiswa drop column if exists angkatan;

alter table public.absensi alter column jam_masuk drop not null;
alter table public.absensi alter column status set default 'Hadir';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'absensi_status_valid') then
    alter table public.absensi
      add constraint absensi_status_valid
      check (status in ('Hadir', 'Tidak Hadir', 'Izin', 'Sakit'));
  end if;
end $$;

create index if not exists mahasiswa_prodi_id_idx on public.mahasiswa using btree (prodi_id);
create index if not exists mahasiswa_angkatan_id_idx on public.mahasiswa using btree (angkatan_id);
create index if not exists absensi_status_idx on public.absensi using btree (status);

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

commit;
