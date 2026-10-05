"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUnreadCount,
  selectUnreadCount,
} from "@/store/slices/notificationSlice";

export function useNotificationPoller(intervalMs = 30000) {
  const dispatch = useDispatch();
  const unreadCount = useSelector(selectUnreadCount);

  useEffect(() => {
    // Initial fetch
    dispatch(fetchUnreadCount() as any);

    // Poll
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount() as any);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [dispatch, intervalMs]);

  return unreadCount;
}
