import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as userApi from "../api/userApi";
import { toast } from "sonner";

export const fetchSuggestedUsers = createAsyncThunk(
  "users/fetchSuggested",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getSuggestedUsers();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const followUser = createAsyncThunk(
  "users/follow",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userApi.followUser(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSettings = createAsyncThunk(
  "users/updateSettings",
  async (settings, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUserSettings(settings);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  "users/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.deleteUserAccount();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    suggestedUsers: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    dismissSuggestedUser: (state, action) => {
      state.suggestedUsers = state.suggestedUsers.filter(
        (user) => user._id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestedUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuggestedUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suggestedUsers = action.payload.users;
      })
      .addCase(fetchSuggestedUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
        toast.error(action.payload.message);
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.suggestedUsers = state.suggestedUsers.filter(
          (user) => user._id !== action.payload.followedUser._id
        );
        toast.success(action.payload.message);
      })
      .addCase(followUser.rejected, (state, action) => {
        toast.error(action.payload.message);
      });
  },
});

export const { dismissSuggestedUser } = userSlice.actions;
export default userSlice.reducer;
