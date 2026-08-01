"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function Home() {
  const router = useRouter();
  const { user, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [isInitialized, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <p className="font-body text-sm text-ink/50">Loading…</p>
    </div>
  );
}
