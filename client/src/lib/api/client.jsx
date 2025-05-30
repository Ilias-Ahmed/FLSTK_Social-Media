import { io } from "socket.io-client";

const BASE_URL = `${
  import.meta.env.VITE_API_URL || "https://nodenest-m94k.onrender.com"
}/api`;
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "token";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok)
    throw new ApiError(data.message || "An error occurred", response.status);
  return data;
};

const createHeaders = (customHeaders = {}, body) => {
  const headers = new Headers(customHeaders);
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(body instanceof FormData))
    headers.set("Content-Type", "application/json");
  return headers;
};

export const apiCall = async (
  endpoint,
  method = "GET",
  body = null,
  customHeaders = {}
) => {
  const headers = createHeaders(customHeaders, body);
  const config = {
    method,
    headers,
    credentials: "include",
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Network error occurred", 500);
  }
};

// Token Management
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token
    ? localStorage.setItem(TOKEN_KEY, token)
    : localStorage.removeItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// HTTP Method Wrappers
export const get = (endpoint, customHeaders = {}) =>
  apiCall(endpoint, "GET", null, customHeaders);
export const post = (endpoint, data, customHeaders = {}) =>
  apiCall(endpoint, "POST", data, customHeaders);
export const put = (endpoint, data, customHeaders = {}) =>
  apiCall(endpoint, "PUT", data, customHeaders);
export const del = (endpoint, customHeaders = {}) =>
  apiCall(endpoint, "DELETE", null, customHeaders);

// Socket Connection
export const createSocketConnection = () => {
  const token = getToken();
  return io(import.meta.env.VITE_API_URL, {
    query: { token },
    transports: ["websocket"],
  });
};

// Abort Controller Helper
export const createAbortController = () => new AbortController();
