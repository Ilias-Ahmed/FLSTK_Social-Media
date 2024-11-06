import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import profileReducer from "../features/profile/slices/profileSlice";
import postReducer from "@/features/posts/slices/postSlice";
import userReducer from "@/features/user/slices/userSlice";
import conversationReducer from "@/features/conversation/slices/conversationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    posts: postReducer,
    users: userReducer,
    conversation: conversationReducer,
  },
});
