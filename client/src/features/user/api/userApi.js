import { get, post, del } from "@/lib/api/client";

export const ENDPOINTS = {
  GET_SUGGESTED_USERS: "/users/suggested",
  FOLLOW_USER: (userId) => `/users/${userId}/follow`,
  UPDATE_SETTINGS: "/users/settings",
  DELETE_ACCOUNT: "/users/delete",
};

export const getSuggestedUsers = () => get(ENDPOINTS.GET_SUGGESTED_USERS);
export const followUser = (userId) => post(ENDPOINTS.FOLLOW_USER(userId));
export const updateUserSettings = (settings) =>
  post(ENDPOINTS.UPDATE_SETTINGS, settings);
export const deleteUserAccount = () => del(ENDPOINTS.DELETE_ACCOUNT);
