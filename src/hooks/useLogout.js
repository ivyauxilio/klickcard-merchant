"use client";

import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/store/slices/authSlice";
import { addNotification } from "@/store/slices/uiSlice";

export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      dispatch(
        addNotification({
          type: "success",
          message: "Logged out successfully",
        }),
      );

      router.push("/login");
      router.refresh();
    } catch (error) {
      dispatch(
        addNotification({
          type: "warning",
          message: error || "Logged out, but API call failed",
        }),
      );

      router.push("/login");
      router.refresh();
    }
  };

  return { logout };
};
