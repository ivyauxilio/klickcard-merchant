"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

// Wrap any protected page's content with <AuthGuard> to require a logged-in
// user. Route-level protection also happens in src/middleware.js using the
// cookie, so this is the client-side backstop that keeps state in sync.
export default function AuthGuard({ children }) {
  const router = useRouter();
  const { user, isInitialized, status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
  }, [isInitialized, user, router]);

  if (!isInitialized || (status === "loading" && !user)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-body text-sm text-ink/50">Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
