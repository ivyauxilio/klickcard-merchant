"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

// Wrap login/register/forgot-password pages so a logged-in user gets bounced
// to the dashboard instead of seeing the auth forms again.
export default function GuestGuard({ children }) {
  const router = useRouter();
  const { user, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isInitialized && user) {
      router.replace("/dashboard");
    }
  }, [isInitialized, user, router]);

  if (isInitialized && user) {
    return null;
  }

  return children;
}
