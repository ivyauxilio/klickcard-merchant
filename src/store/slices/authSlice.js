import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import api, { extractErrors } from "@/lib/axios";

const TOKEN_COOKIE = "auth_token";
const TOKEN_EXPIRY_DAYS = 7;

/**
 * These thunks assume the following Laravel 12 + Sanctum routes.
 * Adjust the paths/payloads in src/lib/axios calls below to match your
 * actual routes/web.php or routes/api.php if they differ.
 *
 *   POST /register            { name, email, password, password_confirmation } -> { user, token }
 *   POST /login                { email, password }                             -> { user, token }
 *   POST /logout               (auth)                                          -> {}
 *   GET  /user                 (auth)                                          -> { user }  (or the user object directly)
 *   PUT  /profile               (auth)  { name, email, ... }                    -> { user }
 *   POST /forgot-password      { email }                                       -> { message }
 *   POST /reset-password       { token, email, password, password_confirmation }-> { message }
 */

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/register", payload);
      return data;
    } catch (error) {
      return rejectWithValue(extractErrors(error));
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/login", payload);
      console.log("data", data);
      const { user, access_token } = data;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
      }
      return data;
    } catch (error) {
      return rejectWithValue(extractErrors(error));
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await api.post("/logout");
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("persist:root"); // If using redux-persist
      }

      // Import and dispatch resetUI action
      const { resetUI } = await import("@/store/slices/uiSlice");
      dispatch(resetUI());

      return null;
    } catch (error) {
      // Even if the server call fails, we still clear the local session.
      // return rejectWithValue(extractErrors(error));
      // Even if API fails, clear local data
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("persist:root");
      }

      // Import and dispatch resetUI action
      const { resetUI } = await import("@/store/slices/uiSlice");
      dispatch(resetUI());
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/user");
      return data.user ?? data;
    } catch (error) {
      return rejectWithValue(extractErrors(error));
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/profile", payload);
      return data.user ?? data;
    } catch (error) {
      return rejectWithValue(extractErrors(error));
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/forgot-password", payload);
      return data;
    } catch (error) {
      return rejectWithValue(extractErrors(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/reset-password", payload);
      return data;
    } catch (error) {
      return rejectWithValue(extractErrors(error));
    }
  },
);
export const hydrateAuth = createAsyncThunk(
  "auth/hydrate",
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
          return {
            token,
            user: JSON.parse(user),
            isAuthenticated: true,
          };
        }
      }
      return null;
    } catch (error) {
      return rejectWithValue("Failed to hydrate auth");
    }
  },
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: "idle", // idle | loading | succeeded | failed
  isInitialized: false, // becomes true once we've checked for an existing session
  errors: null,
  message: null, // used for forgot/reset password confirmation text
  isHydrated: false,
};

function setSession(token) {
  if (token) {
    Cookies.set(TOKEN_COOKIE, token, {
      expires: TOKEN_EXPIRY_DAYS,
      sameSite: "lax",
    });
  } else {
    Cookies.remove(TOKEN_COOKIE);
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrate: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
          state.token = token;
          state.user = JSON.parse(user);
          state.isAuthenticated = true; // Make sure this is set to true
        } else {
          state.isAuthenticated = false;
        }
      }
      state.isInitialized = true;
    },
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    clearAuthErrors(state) {
      state.errors = null;
    },
    clearAuthMessage(state) {
      state.message = null;
    },
    markInitialized(state) {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.errors = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        setSession(action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.errors = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.errors = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        setSession(action.payload.access_token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.errors = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.status = "idle";
        setSession(null);
        console.log("load logout slice");
      })
      .addCase(logoutUser.rejected, (state) => {
        // Clear local session regardless so the user isn't stuck.
        state.user = null;
        state.token = null;
        state.status = "idle";
        setSession(null);
      })

      // Fetch current user (session bootstrap)
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isInitialized = true;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.token = null;
        state.isInitialized = true;
        setSession(null);
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
        state.errors = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.errors = action.payload;
      })

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.errors = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message =
          action.payload.message || "Check your email for a reset link.";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.errors = action.payload;
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.errors = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message =
          action.payload.message || "Your password has been reset.";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.errors = action.payload;
      })
      // Hydrate
      .addCase(hydrateAuth.pending, (state) => {
        state.isHydrated = false;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.isHydrated = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.isHydrated = true;
        state.isAuthenticated = false;
      });
  },
});

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const { clearAuthErrors, clearAuthMessage, markInitialized } =
  authSlice.actions;
export default authSlice.reducer;
