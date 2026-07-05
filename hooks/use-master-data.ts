"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Angkatan, Prodi } from "@/lib/types";

export function useMasterData() {
  const [prodi, setProdi] = useState<Prodi[]>([]);
  const [angkatan, setAngkatan] = useState<Angkatan[]>([]);
  const [muatMaster, setMuatMaster] = useState(true);
  const [galatMaster, setGalatMaster] = useState("");

  const muatUlangMaster = useCallback(async () => {
    setMuatMaster(true);
    setGalatMaster("");

    const [hasilProdi, hasilAngkatan] = await Promise.all([
      supabase.from("prodi").select("id, nama_prodi, created_at").order("nama_prodi", { ascending: true }),
      supabase.from("angkatan").select("id, tahun, created_at").order("tahun", { ascending: false }),
    ]);

    if (hasilProdi.error || hasilAngkatan.error) {
      setGalatMaster("Data master prodi dan angkatan tidak dapat dimuat. Jalankan migrasi database terbaru.");
    } else {
      setProdi((hasilProdi.data ?? []) as Prodi[]);
      setAngkatan((hasilAngkatan.data ?? []) as Angkatan[]);
    }

    setMuatMaster(false);
  }, []);

  useEffect(() => {
    muatUlangMaster();
  }, [muatUlangMaster]);

  return { prodi, angkatan, muatMaster, galatMaster, muatUlangMaster };
}
