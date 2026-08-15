import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// ============================================
// ASYNC THUNKS
// ============================================

// Get promotions
export const getPromotions = createAsyncThunk(
  "promotion/getPromotions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/merchant/promotions", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get promotions",
      );
    }
  },
);

// Get single promotion
export const getPromotion = createAsyncThunk(
  "promotion/getPromotion",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/merchant/promotions/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get promotion",
      );
    }
  },
);

// Create promotion
export const createPromotion = createAsyncThunk(
  "promotion/createPromotion",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/merchant/promotions", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create promotion",
      );
    }
  },
);

// Update promotion
export const updatePromotion = createAsyncThunk(
  "promotion/updatePromotion",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/merchant/promotions/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update promotion",
      );
    }
  },
);

// Delete promotion
export const deletePromotion = createAsyncThunk(
  "promotion/deletePromotion",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/merchant/promotions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete promotion",
      );
    }
  },
);

export const fetchMenuItemsForPromotion = createAsyncThunk(
  "promotion/fetchMenuItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/merchant/menu-items", {
        params: {
          per_page: 100,
          status: "available",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch menu items",
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
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  },
  stats: {
    total: 0,
    active: 0,
    expired: 0,
    inactive: 0,
  },
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "",
    promo_type: "",
  },
};

// ============================================
// SLICE
// ============================================

const promotionSlice = createSlice({
  name: "promotion",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        status: "",
        promo_type: "",
      };
    },
    clearCurrentPromotion: (state) => {
      state.currentItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Promotions
      .addCase(getPromotions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPromotions.fulfilled, (state, action) => {
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
      .addCase(getPromotions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Single Promotion
      .addCase(getPromotion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPromotion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.data;
        state.error = null;
      })
      .addCase(getPromotion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Promotion
      .addCase(createPromotion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload.data);
        state.stats.total += 1;
        state.error = null;
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMenuItemsForPromotion.pending, (state) => {
        state.menuItemsLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuItemsForPromotion.fulfilled, (state, action) => {
        state.menuItemsLoading = false;
        state.menuItems = action.payload.data.data || [];
        state.error = null;
      })
      .addCase(fetchMenuItemsForPromotion.rejected, (state, action) => {
        state.menuItemsLoading = false;
        state.error = action.payload;
      })
      // Update Promotion
      .addCase(updatePromotion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePromotion.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(
          (item) => item.promotion_id === action.payload.data.promotion_id,
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        state.currentItem = action.payload.data;
        state.error = null;
      })
      .addCase(updatePromotion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Promotion
      .addCase(deletePromotion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(
          (item) => item.promotion_id !== action.payload,
        );
        state.stats.total -= 1;
        state.error = null;
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ============================================
// EXPORTS
// ============================================

export const { setFilters, clearFilters, clearCurrentPromotion, clearError } =
  promotionSlice.actions;
export default promotionSlice.reducer;

// Selectors
export const selectPromotions = (state) => state.promotion.items;
export const selectCurrentPromotion = (state) => state.promotion.currentItem;
export const selectPromotionPagination = (state) => state.promotion.pagination;
export const selectPromotionStats = (state) => state.promotion.stats;
export const selectPromotionLoading = (state) => state.promotion.isLoading;
export const selectPromotionError = (state) => state.promotion.error;
export const selectPromotionFilters = (state) => state.promotion.filters;
export const selectMenuItemsForPromotion = (state) => state.promotion.menuItems;
export const selectMenuItemsLoading = (state) =>
  state.promotion.menuItemsLoading;
