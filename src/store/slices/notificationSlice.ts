// store/slices/notificationSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { notificationAPI, NotificationData } from "../../lib/notifications";

// ============================================
// THUNKS
// ============================================

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (
    params: {
      page?: number;
      refresh?: boolean;
      unread_only?: boolean;
      type?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await notificationAPI.list({
        page: params.page ?? 1,
        unread_only: params.unread_only,
        type: params.type,
      });
      return {
        ...res,
        page: params.page ?? 1,
        refresh: !!params.refresh,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load notifications",
      );
    }
  },
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/unreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationAPI.unreadCount();
      return res.data.count;
    } catch (error: any) {
      return rejectWithValue("Failed");
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id: number | string, { rejectWithValue }) => {
    try {
      await notificationAPI.markAsRead(id);
      return id;
    } catch (error: any) {
      return rejectWithValue("Failed");
    }
  },
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationAPI.markAllAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue("Failed");
    }
  },
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id: number | string, { rejectWithValue }) => {
    try {
      await notificationAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue("Failed");
    }
  },
);

export const clearAllNotifications = createAsyncThunk(
  "notifications/clearAll",
  async (onlyRead: boolean = false, { rejectWithValue }) => {
    try {
      await notificationAPI.clearAll(onlyRead);
      return onlyRead;
    } catch (error: any) {
      return rejectWithValue("Failed");
    }
  },
);

// ============================================
// SLICE
// ============================================

interface NotificationState {
  list: NotificationData[];
  unreadCount: number;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    unread_only: boolean;
    type: string;
  };
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: NotificationState = {
  list: [],
  unreadCount: 0,
  pagination: { current_page: 1, last_page: 1, total: 0 },
  filters: { unread_only: false, type: "all" },
  loading: false,
  loadingMore: false,
  refreshing: false,
  error: null,
  lastFetched: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setFilter: (
      state,
      action: PayloadAction<Partial<NotificationState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetNotifications: (state) => {
      state.list = [];
      state.pagination = { current_page: 1, last_page: 1, total: 0 };
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
    // Optimistic: mark as read locally
    markAsReadOptimistic: (state, action: PayloadAction<number | string>) => {
      const id = action.payload;
      const item = state.list.find((n) => n.id === id);
      if (item && !item.read_at) {
        item.read_at = new Date().toISOString();
        item.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================
      // FETCH LIST
      // ============================================
      .addCase(fetchNotifications.pending, (state, action) => {
        const { page, refresh } = action.meta.arg;
        if (refresh) state.refreshing = true;
        else if (page && page > 1) state.loadingMore = true;
        else state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.refreshing = false;

        const { data, current_page, last_page, total } = action.payload.data;
        const isFirstPage = current_page === 1;

        state.list = isFirstPage ? data : [...state.list, ...data];
        state.pagination = {
          current_page,
          last_page,
          total: total ?? state.list.length,
        };
        state.unreadCount = action.payload.unread_count ?? state.unreadCount;
        state.lastFetched = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.refreshing = false;
        state.error = action.payload as string;
      })

      // ============================================
      // UNREAD COUNT
      // ============================================
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // ============================================
      // MARK AS READ
      // ============================================
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        const item = state.list.find((n) => n.id === id);
        if (item && !item.read_at) {
          item.read_at = new Date().toISOString();
          item.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // ============================================
      // MARK ALL AS READ
      // ============================================
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.list = state.list.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
          is_read: true,
        }));
        state.unreadCount = 0;
      })

      // ============================================
      // DELETE
      // ============================================
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const item = state.list.find((n) => n.id === id);
        if (item && !item.read_at) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.list = state.list.filter((n) => n.id !== id);
      })

      // ============================================
      // CLEAR ALL
      // ============================================
      .addCase(clearAllNotifications.fulfilled, (state, action) => {
        const onlyRead = action.payload;
        if (onlyRead) {
          state.list = state.list.filter((n) => !n.read_at);
          // unread count stays the same
        } else {
          state.list = [];
          state.unreadCount = 0;
        }
      });
  },
});

export const {
  setFilter,
  resetNotifications,
  incrementUnread,
  markAsReadOptimistic,
} = notificationSlice.actions;

// ============================================
// SELECTORS
// ============================================

export const selectNotifications = (state: any) => state.notifications.list;
export const selectUnreadCount = (state: any) =>
  state.notifications.unreadCount;
export const selectNotificationPagination = (state: any) =>
  state.notifications.pagination;
export const selectNotificationFilters = (state: any) =>
  state.notifications.filters;
export const selectNotificationLoading = (state: any) =>
  state.notifications.loading;
export const selectNotificationLoadingMore = (state: any) =>
  state.notifications.loadingMore;
export const selectNotificationRefreshing = (state: any) =>
  state.notifications.refreshing;

export default notificationSlice.reducer;
