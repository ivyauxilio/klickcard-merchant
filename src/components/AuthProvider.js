"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { hydrateAuth } from "@/store/slices/authSlice";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Hydrate auth state on client-side mount
    dispatch(hydrateAuth());
  }, [dispatch]);

  return children;
}
