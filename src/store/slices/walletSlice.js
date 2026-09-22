import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export const fetchWallet = createAsyncThunk(
  "wallet/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/merchant/wallet");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load wallet",
      );
    }
  },
);

export const checkCredits = createAsyncThunk(
  "wallet/checkCredits",
  async (voucherType, { rejectWithValue }) => {
    try {
      const response = await api.post("/merchant/promotions/check-credits", {
        voucher_type: voucherType,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to check credits",
      );
    }
  },
);

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    data: null,
    loading: false,
    error: null,
    creditCheck: null, // last credit check result
  },
  reducers: {
    updateBalance: (state, action) => {
      if (state.data) {
        state.data.credit_balance = action.payload;
      }
    },
    clearCreditCheck: (state) => {
      state.creditCheck = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkCredits.fulfilled, (state, action) => {
        state.creditCheck = action.payload;
      });
  },
});

export const { updateBalance, clearCreditCheck } = walletSlice.actions;

export const selectWallet = (state) => state.wallet.data;
export const selectWalletLoading = (state) => state.wallet.loading;
export const selectCreditBalance = (state) =>
  state.wallet.data?.credit_balance ?? 0;
export const selectCreditCheck = (state) => state.wallet.creditCheck;

export default walletSlice.reducer;
