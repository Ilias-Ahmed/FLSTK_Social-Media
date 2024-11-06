import { get, post, put, del } from "@/lib/api/client";

// Centralized endpoints for easier maintenance
export const ENDPOINTS = {
  GET_POSTS: "/posts",
  GET_POST: (id) => `/posts/${id}`,
  CREATE_POST: "/posts",
  UPDATE_POST: (id) => `/posts/${id}`,
  DELETE_POST: (id) => `/posts/${id}`,
  LIKE_POST: (id) => `/posts/${id}/like`,
  BOOKMARK_POST: (id) => `/posts/${id}/bookmark`,
  ADD_COMMENT: (id) => `/posts/${id}/comments`,
  DELETE_COMMENT: (postId, commentId) =>
    `/posts/${postId}/comments/${commentId}`,
};

export const getPosts = (page = 1, limit = 10) =>
  get(`${ENDPOINTS.GET_POSTS}?page=${page}&limit=${limit}`);

export const getPost = (postId) => get(ENDPOINTS.GET_POST(postId));

export const createPost = (postData) =>
  post(ENDPOINTS.CREATE_POST, postData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updatePost = (postId, formData) =>
  put(ENDPOINTS.UPDATE_POST(postId), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deletePost = (postId) => del(ENDPOINTS.DELETE_POST(postId));

export const likePost = (postId) => post(ENDPOINTS.LIKE_POST(postId));

export const bookmarkPost = (postId) => post(ENDPOINTS.BOOKMARK_POST(postId));

export const addComment = (postId, text) =>
  post(ENDPOINTS.ADD_COMMENT(postId), { text });

export const deleteComment = (postId, commentId) =>
  del(ENDPOINTS.DELETE_COMMENT(postId, commentId));
