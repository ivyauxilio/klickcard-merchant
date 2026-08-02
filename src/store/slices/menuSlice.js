import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// ============================================
// ASYNC THUNKS
// ============================================

// Get menu items
export const getMenuItems = createAsyncThunk(
  "menu/getItems",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/merchant/menu-items", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get menu items",
      );
    }
  },
);

// Get single menu item
export const getMenuItem = createAsyncThunk(
  "menu/getItem",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/merchant/menu-items/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get menu item",
      );
    }
  },
);

// Create menu item
export const createMenuItem = createAsyncThunk(
  "menu/createItem",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/merchant/menu-items", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create menu item",
      );
    }
  },
);

// Update menu item
export const updateMenuItem = createAsyncThunk(
  "menu/updateItem",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/merchant/menu-items/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update menu item",
      );
    }
  },
);

// Delete menu item
export const deleteMenuItem = createAsyncThunk(
  "menu/deleteItem",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/merchant/menu-items/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete menu item",
      );
    }
  },
);

// Add stock
export const addStock = createAsyncThunk(
  "menu/addStock",
  async ({ id, quantity, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/merchant/menu-items/${id}/add-stock`, {
        quantity,
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add stock",
      );
    }
  },
);

// Remove stock
export const removeStock = createAsyncThunk(
  "menu/removeStock",
  async ({ id, quantity, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/merchant/menu-items/${id}/remove-stock`,
        { quantity, reason },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove stock",
      );
    }
  },
);

// Update status
export const updateMenuItemStatus = createAsyncThunk(
  "menu/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/merchant/menu-items/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status",
      );
    }
  },
);

// Get low stock items
export const getLowStockItems = createAsyncThunk(
  "menu/getLowStock",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/merchant/menu-items/low-stock");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get low stock items",
      );
    }
  },
);

// Get categories
export const getMenuCategories = createAsyncThunk(
  "menu/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/merchant/menu-items/categories");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get categories",
      );
    }
  },
);

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  items: [],
  currentItem: null,
  categories: [],
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  },
  stats: {
    total: 0,
    available: 0,
    unavailable: 0,
    out_of_stock: 0,
    in_stock: 0,
    low_stock: 0,
    featured: 0,
    total_value: 0,
  },
  lowStockItems: [],
  isLoading: false,
  error: null,
  filters: {
    search: "",
    // category: "",
    status: "",
    stock_status: "",
  },
};

// ============================================
// SLICE
// ============================================

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        // category: "",
        status: "",
        stock_status: "",
      };
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Items
      .addCase(getMenuItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMenuItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data.data || [];
        state.pagination = {
          currentPage: action.payload.data.current_page || 1,
          lastPage: action.payload.data.last_page || 1,
          perPage: action.payload.data.per_page || 15,
          total: action.payload.data.total || 0,
        };
        state.stats = action.payload.stats || state.stats;
        state.error = null;
      })
      .addCase(getMenuItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Single Item
      .addCase(getMenuItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.data;
        state.error = null;
      })
      .addCase(getMenuItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Item
      .addCase(createMenuItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload.data);
        state.stats.total += 1;
        state.error = null;
      })
      .addCase(createMenuItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Item
      .addCase(updateMenuItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(
          (item) => item.menu_item_id === action.payload.data.menu_item_id,
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        state.currentItem = action.payload.data;
        state.error = null;
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Item
      .addCase(deleteMenuItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(
          (item) => item.menu_item_id !== action.payload,
        );
        state.stats.total -= 1;
        state.error = null;
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add Stock
      .addCase(addStock.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.menu_item_id === action.payload.data.menu_item_id,
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        if (
          state.currentItem &&
          state.currentItem.menu_item_id === action.payload.data.menu_item_id
        ) {
          state.currentItem = action.payload.data;
        }
        // Update stats
        const updatedStats = {
          ...state.stats,
          in_stock: state.items.filter(
            (item) => item.stock_status === "in_stock",
          ).length,
          low_stock: state.items.filter(
            (item) => item.stock_status === "low_stock",
          ).length,
          out_of_stock: state.items.filter(
            (item) => item.stock_status === "out_of_stock",
          ).length,
        };
        state.stats = updatedStats;
      })

      // Remove Stock
      .addCase(removeStock.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.menu_item_id === action.payload.data.menu_item_id,
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        if (
          state.currentItem &&
          state.currentItem.menu_item_id === action.payload.data.menu_item_id
        ) {
          state.currentItem = action.payload.data;
        }
        const updatedStats = {
          ...state.stats,
          in_stock: state.items.filter(
            (item) => item.stock_status === "in_stock",
          ).length,
          low_stock: state.items.filter(
            (item) => item.stock_status === "low_stock",
          ).length,
          out_of_stock: state.items.filter(
            (item) => item.stock_status === "out_of_stock",
          ).length,
        };
        state.stats = updatedStats;
      })

      // Update Status
      .addCase(updateMenuItemStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.menu_item_id === action.payload.data.menu_item_id,
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        if (
          state.currentItem &&
          state.currentItem.menu_item_id === action.payload.data.menu_item_id
        ) {
          state.currentItem = action.payload.data;
        }
        const updatedStats = {
          ...state.stats,
          available: state.items.filter((item) => item.status === "available")
            .length,
          unavailable: state.items.filter(
            (item) => item.status === "unavailable",
          ).length,
          out_of_stock: state.items.filter(
            (item) => item.status === "out_of_stock",
          ).length,
        };
        state.stats = updatedStats;
      })

      // Get Low Stock
      .addCase(getLowStockItems.fulfilled, (state, action) => {
        state.lowStockItems = action.payload.low_stock || [];
      })

      // Get Categories
      .addCase(getMenuCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data || [];
      });
  },
});

// ============================================
// EXPORTS
// ============================================

export const { setFilters, clearFilters, clearCurrentItem, clearError } =
  menuSlice.actions;
export default menuSlice.reducer;

// Selectors
export const selectMenuItems = (state) => state.menu.items;
export const selectCurrentMenuItem = (state) => state.menu.currentItem;
export const selectMenuPagination = (state) => state.menu.pagination;
export const selectMenuStats = (state) => state.menu.stats;
export const selectMenuCategories = (state) => state.menu.categories;
export const selectLowStockItems = (state) => state.menu.lowStockItems;
export const selectMenuLoading = (state) => state.menu.isLoading;
export const selectMenuError = (state) => state.menu.error;
export const selectMenuFilters = (state) => state.menu.filters;
