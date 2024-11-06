import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { register, login, logout } from "../api/authApi";
import { toast } from "sonner";
import { get } from "@/lib/api/client";
import { togglePostBookmark } from "@/features/posts/slices/postSlice";

// Helper function to handle rejections
const handleReject = (error) => {
  const message = error.response?.data?.message || error.message;
  return { message, success: false };
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,
  bookmarkStatus: {},
};

export const loadUserFromStorage = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await get("/users/profile");
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await register(userData);
      localStorage.setItem("token", response.token);
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await login(credentials);
      localStorage.setItem("token", response.token);
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logout();
      localStorage.removeItem("token");
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUserBookmarks: (state, action) => {
      if (state.user) {
        state.user.bookmarks = action.payload;
        state.bookmarkStatus = action.payload.reduce((acc, bookmarkId) => {
          acc[bookmarkId] = true;
          return acc;
        }, {});
      }
    },
    updateSingleBookmark: (state, action) => {
      const { postId, isBookmarked } = action.payload;
      if (state.user) {
        state.bookmarkStatus[postId] = isBookmarked;
        if (isBookmarked) {
          state.user.bookmarks = [
            ...new Set([...state.user.bookmarks, postId]),
          ];
        } else {
          state.user.bookmarks = state.user.bookmarks.filter(
            (id) => id !== postId
          );
        }
      }
    },
    resetBookmarks: (state) => {
      state.bookmarkStatus = {};
      if (state.user) {
        state.user.bookmarks = [];
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUserFromStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.bookmarkStatus =
          action.payload.user.bookmarks?.reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {}) || {};
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
        if (action.payload.message) {
          toast.error(action.payload.message);
        }
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        toast.success(action.payload.message);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
        toast.error(action.payload.message);
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        toast.success(action.payload.message);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
        toast.error(action.payload.message);
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.bookmarkStatus = {};
        toast.success(action.payload.message);
      })
      .addCase(logoutUser.rejected, (state, action) => {
        toast.error(action.payload.message);
      })
      // Handle Bookmark Toggle
      .addCase(togglePostBookmark.fulfilled, (state, action) => {
        if (!state.user) return;
        const bookmarkExists = state.user.bookmarks.includes(
          action.payload.postId
        );
        if (bookmarkExists) {
          state.user.bookmarks = state.user.bookmarks.filter(
            (id) => id !== action.payload.postId
          );
        } else {
          state.user.bookmarks.push(action.payload.postId);
        }
        toast.success(action.payload.message);
      });
  },
});

export const {
  updateUserBookmarks,
  updateSingleBookmark,
  resetBookmarks,
  clearError,
} = authSlice.actions;

export const selectIsBookmarked = (state, postId) =>
  Boolean(state.auth.bookmarkStatus[postId]);

export default authSlice.reducer;
