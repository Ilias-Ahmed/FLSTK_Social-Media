import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as profileApi from "../api/profileApi";
import { toast } from "sonner";

const handleReject = (error) => {
  const message = error.response?.data?.message || error.message;
  return { message, success: false };
};

const initialState = {
  user: null,
  posts: [],
  suggestedUsers: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileApi.getUserProfile();
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "profile/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateProfile(formData);
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const fetchOtherProfile = createAsyncThunk(
  "profile/fetchOtherProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await profileApi.getOthersProfile(userId);
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const toggleFollowUser = createAsyncThunk(
  "profile/toggleFollow",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await profileApi.toggleFollowUser(userId);
      return { ...response, userId };
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const fetchSuggestedUsers = createAsyncThunk(
  "profile/fetchSuggested",
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileApi.getSuggestedUsers();
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    resetProfile: () => initialState,
    updateProfileStats: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile Cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.posts = action.payload.user.posts || [];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
        toast.error(action.payload.message);
      })
      // Update Profile Cases
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.lastUpdated = new Date().toISOString();
        toast.success(action.payload.message);
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
        toast.error(action.payload.message);
      })
      // Fetch Other Profile Cases
      .addCase(fetchOtherProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOtherProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.posts = action.payload.user.posts || [];
        toast.success(action.payload.message);
      })
      .addCase(fetchOtherProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
        toast.error(action.payload.message);
      })
      // Toggle Follow Cases
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        if (state.user?._id === action.payload.userId) {
          state.user.followers = action.payload.followers;
        }
        toast.success(action.payload.message);
      })
      .addCase(toggleFollowUser.rejected, (state, action) => {
        toast.error(action.payload.message);
      })
      // Fetch Suggested Users Cases
      .addCase(fetchSuggestedUsers.fulfilled, (state, action) => {
        state.suggestedUsers = action.payload.users;
        toast.success(action.payload.message);
      })
      .addCase(fetchSuggestedUsers.rejected, (state, action) => {
        toast.error(action.payload.message);
      });
  },
});

// Selectors
export const selectProfile = (state) => state.profile.user;
export const selectProfileLoading = (state) => state.profile.isLoading;
export const selectProfileError = (state) => state.profile.error;
export const selectProfilePosts = (state) => state.profile.posts;
export const selectLastUpdated = (state) => state.profile.lastUpdated;
export const selectSuggestedUsers = (state) => state.profile.suggestedUsers;

export const { clearProfileError, resetProfile, updateProfileStats } =
  profileSlice.actions;
export default profileSlice.reducer;
