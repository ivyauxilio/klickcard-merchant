// store/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// ============================================
// ASYNC THUNKS
// ============================================

// Fetch all products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/merchant/products", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products",
      );
    }
  },
);

// Fetch single product
export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/merchant/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product",
      );
    }
  },
);

// Create product
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/merchant/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to create product",
        },
      );
    }
  },
);

// Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      formData.append("_method", "PUT");
      const response = await api.post(`/merchant/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to update product",
        },
      );
    }
  },
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/merchant/products/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product",
      );
    }
  },
);

// Toggle product status
export const toggleProductStatus = createAsyncThunk(
  "products/toggleProductStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/merchant/products/${id}/toggle-status`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle status",
      );
    }
  },
);

// Toggle featured status
export const toggleProductFeatured = createAsyncThunk(
  "products/toggleProductFeatured",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/merchant/products/${id}/toggle-featured`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle featured",
      );
    }
  },
);

// Duplicate product
export const duplicateProduct = createAsyncThunk(
  "products/duplicateProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/merchant/products/${id}/duplicate`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to duplicate product",
      );
    }
  },
);

// Bulk update stock
export const bulkUpdateStock = createAsyncThunk(
  "products/bulkUpdateStock",
  async (products, { rejectWithValue }) => {
    try {
      const response = await api.post("/merchant/products/bulk/stock", {
        products,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update stock",
      );
    }
  },
);

// Fetch stats
export const fetchProductStats = createAsyncThunk(
  "products/fetchProductStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/merchant/products/stats");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats",
      );
    }
  },
);

// Fetch categories
export const fetchProductCategories = createAsyncThunk(
  "products/fetchProductCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/merchant/products/categories");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories",
      );
    }
  },
);

// ============================================
// SLICE
// ============================================

const initialState = {
  // List
  products: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  },

  // Current product (for detail/edit)
  currentProduct: null,

  // Stats
  stats: {
    total: 0,
    in_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
    active_discounts: 0,
    featured: 0,
  },

  // Categories
  categories: [],

  // Loading states
  loading: false,
  loadingCurrent: false,
  submitting: false,
  deleting: false,

  // Error
  error: null,

  // Filters (persisted across page changes)
  filters: {
    search: "",
    category: "",
    status: "all",
    sortBy: "created_at",
    sortOrder: "desc",
  },
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Clear current product (when leaving detail page)
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.error = null;
    },

    // Clear error
    clearProductError: (state) => {
      state.error = null;
    },

    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Update a single product in the list (after edit)
    updateProductInList: (state, action) => {
      const updated = action.payload;
      const index = state.products.findIndex(
        (p) => p.product_id === updated.product_id,
      );
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updated };
      }
      // Also update currentProduct if it matches
      if (
        state.currentProduct &&
        state.currentProduct.product_id === updated.product_id
      ) {
        state.currentProduct = { ...state.currentProduct, ...updated };
      }
    },

    // Remove product from list (after delete)
    removeProductFromList: (state, action) => {
      state.products = state.products.filter(
        (p) => p.product_id !== action.payload,
      );
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
  },

  extraReducers: (builder) => {
    builder
      // ============================================
      // FETCH PRODUCTS
      // ============================================
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Handle paginated response
        const data = action.payload.data;
        if (data && data.data) {
          state.products = data.data;
          state.pagination = {
            current_page: data.current_page,
            last_page: data.last_page,
            per_page: data.per_page,
            total: data.total,
          };
        } else {
          state.products = data || [];
        }
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============================================
      // FETCH SINGLE PRODUCT
      // ============================================
      .addCase(fetchProductById.pending, (state) => {
        state.loadingCurrent = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loadingCurrent = false;
        // Store full product with discounts and points
        state.currentProduct = action.payload.data;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loadingCurrent = false;
        state.error = action.payload;
      })

      // ============================================
      // CREATE PRODUCT
      // ============================================
      .addCase(createProduct.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.submitting = false;
        // Add to list
        if (action.payload.data) {
          state.products.unshift(action.payload.data);
        }
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // ============================================
      // UPDATE PRODUCT
      // ============================================
      .addCase(updateProduct.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.submitting = false;
        const updatedProduct = action.payload.data;

        // Update current product with full data (discounts, points)
        if (updatedProduct) {
          state.currentProduct = updatedProduct;

          // Update in list
          const index = state.products.findIndex(
            (p) => p.product_id === updatedProduct.product_id,
          );
          if (index !== -1) {
            state.products[index] = {
              ...state.products[index],
              ...updatedProduct,
            };
          }
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // ============================================
      // DELETE PRODUCT
      // ============================================
      .addCase(deleteProduct.pending, (state) => {
        state.deleting = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleting = false;
        state.products = state.products.filter(
          (p) => p.product_id !== action.payload.id,
        );
        if (
          state.currentProduct &&
          state.currentProduct.product_id === action.payload.id
        ) {
          state.currentProduct = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // ============================================
      // TOGGLE STATUS
      // ============================================
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        const { product_id, is_active } = action.payload.data;
        const index = state.products.findIndex(
          (p) => p.product_id === product_id,
        );
        if (index !== -1) {
          state.products[index].is_active = is_active;
        }
        if (
          state.currentProduct &&
          state.currentProduct.product_id === product_id
        ) {
          state.currentProduct.is_active = is_active;
        }
      })

      // ============================================
      // TOGGLE FEATURED
      // ============================================
      .addCase(toggleProductFeatured.fulfilled, (state, action) => {
        const { product_id, is_featured } = action.payload.data;
        const index = state.products.findIndex(
          (p) => p.product_id === product_id,
        );
        if (index !== -1) {
          state.products[index].is_featured = is_featured;
        }
        if (
          state.currentProduct &&
          state.currentProduct.product_id === product_id
        ) {
          state.currentProduct.is_featured = is_featured;
        }
      })

      // ============================================
      // DUPLICATE PRODUCT
      // ============================================
      .addCase(duplicateProduct.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.products.unshift(action.payload.data);
        }
      })

      // ============================================
      // BULK UPDATE STOCK
      // ============================================
      .addCase(bulkUpdateStock.fulfilled, (state, action) => {
        // Optionally update products in list
        // Reload is often simpler
      })

      // ============================================
      // FETCH STATS
      // ============================================
      .addCase(fetchProductStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })

      // ============================================
      // FETCH CATEGORIES
      // ============================================
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data || [];
      });
  },
});

// ============================================
// ACTIONS
// ============================================
export const {
  clearCurrentProduct,
  clearProductError,
  setFilters,
  resetFilters,
  updateProductInList,
  removeProductFromList,
} = productSlice.actions;

// ============================================
// SELECTORS
// ============================================
export const selectProducts = (state) => state.products.products;
export const selectPagination = (state) => state.products.pagination;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectProductStats = (state) => state.products.stats;
export const selectProductCategories = (state) => state.products.categories;
export const selectProductLoading = (state) => state.products.loading;
export const selectCurrentProductLoading = (state) =>
  state.products.loadingCurrent;
export const selectProductSubmitting = (state) => state.products.submitting;
export const selectProductDeleting = (state) => state.products.deleting;
export const selectProductError = (state) => state.products.error;
export const selectProductFilters = (state) => state.products.filters;

// Discount selectors
export const selectCurrentProductDiscounts = (state) =>
  state.products.currentProduct?.discounts || [];
export const selectCurrentProductActiveDiscount = (state) =>
  state.products.currentProduct?.discounts?.[0] || null;

// Points selectors
export const selectCurrentProductPoints = (state) =>
  state.products.currentProduct?.points || null;

export default productSlice.reducer;
