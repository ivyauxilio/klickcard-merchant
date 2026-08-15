import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Get merchant stats
export const getMerchantStats = createAsyncThunk(
  "merchant/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/merchant/stats");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get stats",
      );
    }
  },
);

// Get merchant profile
export const getMerchantProfile = createAsyncThunk(
  "merchant/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/merchant/profile");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get profile",
      );
    }
  },
);

const initialState = {
  profile: null,
  stats: null,
  isLoading: false,
  error: null,
};

const merchantSlice = createSlice({
  name: "merchant",
  initialState,
  reducers: {
    clearMerchant: (state) => {
      state.profile = null;
      state.stats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMerchantStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMerchantStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.data;
        state.error = null;
      })
      .addCase(getMerchantStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getMerchantProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMerchantProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
        state.error = null;
      })
      .addCase(getMerchantProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMerchant } = merchantSlice.actions;
export default merchantSlice.reducer;

// Selectors
export const selectMerchantProfile = (state) => state.merchant.profile;
export const selectMerchantStats = (state) => state.merchant.stats;
export const selectMerchantLoading = (state) => state.merchant.isLoading;
export const selectMerchantError = (state) => state.merchant.error;
