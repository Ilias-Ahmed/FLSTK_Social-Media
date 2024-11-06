import { get, post } from "@/lib/api/client";

export const ENDPOINTS = {
  GET_CONVERSATIONS: "/messages/conversations",
  GET_MESSAGES: (conversationId) =>
    `/messages/conversations/${conversationId}/messages`,
  SEND_MESSAGE: "/messages",
  SEARCH_USERS: (query) => `/users/search?q=${encodeURIComponent(query)}`,
  START_CONVERSATION: "/messages/conversations",
};

export const getConversations = () => get(ENDPOINTS.GET_CONVERSATIONS);

export const getMessages = (conversationId) =>
  get(ENDPOINTS.GET_MESSAGES(conversationId));

export const sendMessage = (messageData) =>
  post(ENDPOINTS.SEND_MESSAGE, messageData);

export const searchUsers = (query) => get(ENDPOINTS.SEARCH_USERS(query));

export const startConversation = (userId) =>
  post(ENDPOINTS.START_CONVERSATION, { userId });
