import { post } from "@/lib/api/client";

// Centralized endpoints for easier maintenance
export const ENDPOINTS = {
  REGISTER: "/users/register",
  LOGIN: "/users/login",
  LOGOUT: "/users/logout",
};
export const register = (userData) => post(ENDPOINTS.REGISTER, userData);
export const login = (credentials) => post(ENDPOINTS.LOGIN, credentials);
export const logout = () => post(ENDPOINTS.LOGOUT);
