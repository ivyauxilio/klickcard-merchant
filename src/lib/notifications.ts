import api from "@/lib/axios";

export interface NotificationData {
  id: number;
  uuid: string;
  type: string;
  title: string;
  body: string | null;
  message: string | null;
  image_url: string | null;
  action_url: string | null;
  action_label: string | null;
  data: Record<string, any> | null;
  priority: "low" | "normal" | "high" | "urgent";
  read_at: string | null;
  is_read: boolean;
  expires_at: string | null;
  created_at: string;
  time_ago: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: {
    data: NotificationData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  unread_count: number;
}

export const notificationAPI = {
  list: async (params?: {
    page?: number;
    per_page?: number;
    unread_only?: boolean;
    type?: string;
  }): Promise<NotificationListResponse> => {
    const res = await api.get("/merchant/notifications", { params });
    return res.data;
  },

  unreadCount: async (): Promise<{
    success: boolean;
    data: { count: number };
  }> => {
    const res = await api.get("/merchant/notifications/unread-count");
    return res.data;
  },

  markAsRead: async (id: number | string) => {
    const res = await api.post(`/merchant/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.post("/merchant/notifications/read-all");
    return res.data;
  },

  delete: async (id: number | string) => {
    const res = await api.delete(`/merchant/notifications/${id}`);
    return res.data;
  },

  clearAll: async (onlyRead = false) => {
    const res = await api.delete("/merchant/notifications", {
      params: { only_read: onlyRead },
    });
    return res.data;
  },
};
