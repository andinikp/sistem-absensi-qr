"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [memeriksaSesi, setMemeriksaSesi] = useState(true);

  useEffect(() => {
    let aktif = true;

    async function periksaSesi() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!aktif) return;
      if (!session) {
        router.replace("/login");
        return;
      }
      setMemeriksaSesi(false);
    }

    periksaSesi();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      aktif = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (memeriksaSesi) return <div className="grid min-h-screen place-items-center bg-cream"><p className="text-sm font-medium text-stone-500">Memeriksa sesi admin...</p></div>;
  return <>{children}</>;
}
