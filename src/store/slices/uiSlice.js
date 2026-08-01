import { createSlice } from "@reduxjs/toolkit";

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  theme: "light",
  sidebarOpen: true,
  notifications: [],
  loading: false,
  error: null,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
};

// ============================================
// SLICE
// ============================================

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Theme
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },

    // Loading
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    showLoading: (state) => {
      state.loading = true;
    },
    hideLoading: (state) => {
      state.loading = false;
    },

    // Error
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUI: (state) => {
      state.theme = "light";
      state.sidebarOpen = false; // Reset to desktop default
      state.isMobile = false;
      state.notifications = [];
      state.loading = false;
      state.error = null;
      state.modal.isOpen = false;
      state.modal.type = null;
      state.modal.data = null;
    },

    // ============================================
    // NOTIFICATIONS
    // ============================================
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: action.payload.type || "info", // 'success', 'error', 'warning', 'info'
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        read: false,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },

    // ============================================
    // MODAL
    // ============================================
    openModal: (state, action) => {
      state.modal.isOpen = true;
      state.modal.type = action.payload.type || "default";
      state.modal.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.type = null;
      state.modal.data = null;
    },
    setModalData: (state, action) => {
      state.modal.data = action.payload;
    },

    // ============================================
    // RESET
    // ============================================
    // resetUI: (state) => {
    //   state.notifications = [];
    //   state.loading = false;
    //   state.error = null;
    //   state.modal.isOpen = false;
    //   state.modal.type = null;
    //   state.modal.data = null;
    // },
  },
});

// ============================================
// EXPORT ACTIONS
// ============================================

export const {
  // Theme
  toggleTheme,
  setTheme,

  // Sidebar
  toggleSidebar,
  setSidebarOpen,

  // Loading
  setLoading,
  showLoading,
  hideLoading,

  // Error
  setError,
  clearError,

  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,

  // Modal
  openModal,
  closeModal,
  setModalData,

  // Reset
  resetUI,
} = uiSlice.actions;

// ============================================
// EXPORT DEFAULT
// ============================================

export default uiSlice.reducer;

// ============================================
// SELECTORS
// ============================================

// Theme
export const selectTheme = (state) => state.ui.theme;

// Sidebar
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;

// Loading
export const selectLoading = (state) => state.ui.loading;

// Error
export const selectError = (state) => state.ui.error;

// Notifications
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) =>
  state.ui.notifications.filter((n) => !n.read);
export const selectNotificationCount = (state) =>
  state.ui.notifications.filter((n) => !n.read).length;

// Modal
export const selectModal = (state) => state.ui.modal;
export const selectModalIsOpen = (state) => state.ui.modal.isOpen;
export const selectModalType = (state) => state.ui.modal.type;
export const selectModalData = (state) => state.ui.modal.data;
