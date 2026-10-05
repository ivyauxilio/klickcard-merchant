"use client";

import { useNotificationPoller } from "@/hooks/useNotificationPoller";

export default function NotificationPoller() {
  useNotificationPoller(30000);

  return null;
}
