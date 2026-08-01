"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { fetchCurrentUser, markInitialized } from "@/store/slices/authSlice";

// Mounted once near the root of the app. On first load, if an auth token
// cookie exists we ask the Laravel API who it belongs to so Redux state
// (and therefore the UI) reflects the logged-in user after a page refresh.
export default function SessionInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      dispatch(fetchCurrentUser());
    } else {
      dispatch(markInitialized());
    }
  }, [dispatch]);

  return null;
}
