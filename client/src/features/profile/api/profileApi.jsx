import { get, put } from "@/lib/api/client";

// Centralized endpoints for easier maintenance
export const ENDPOINTS = {
  GET_PROFILE: "/users/profile",
  UPDATE_PROFILE: "/users/profile",
};

export const getUserProfile = () => get(ENDPOINTS.GET_PROFILE);

export const updateProfile = (formData) =>
  put(ENDPOINTS.UPDATE_PROFILE, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
