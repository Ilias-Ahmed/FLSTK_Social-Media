import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
} from "../api/conversationApi";
import { toast } from "sonner";

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  isLoading: false,
  error: null,
  onlineUsers: {},
  typingUsers: {},
};

export const fetchConversations = createAsyncThunk(
  "conversation/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getConversations();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "conversation/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await getMessages(conversationId);
      return { conversationId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendNewMessage = createAsyncThunk(
  "conversation/sendMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await sendMessage(messageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const startNewConversation = createAsyncThunk(
  "conversation/startConversation",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await startConversation(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);

      // Update last message in conversations list
      const conversationIndex = state.conversations.findIndex(
        (c) => c._id === conversationId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message;
      }
    },
    updateOnlineStatus: (state, action) => {
      state.onlineUsers = { ...state.onlineUsers, ...action.payload };
    },
    setTypingStatus: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = {};
      }
      state.typingUsers[conversationId][userId] = isTyping;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.data;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      .addCase(sendNewMessage.fulfilled, (state, action) => {
        const message = action.payload;
        if (!state.messages[message.conversationId]) {
          state.messages[message.conversationId] = [];
        }
        state.messages[message.conversationId].push(message);
      })
      .addCase(startNewConversation.fulfilled, (state, action) => {
        const conversation = action.payload;
        const exists = state.conversations.some(
          (c) => c._id === conversation._id
        );
        if (!exists) {
          state.conversations.unshift(conversation);
        }
        state.activeConversation = conversation._id;
      });
  },
});

export const {
  setActiveConversation,
  addMessage,
  updateOnlineStatus,
  setTypingStatus,
} = conversationSlice.actions;

export default conversationSlice.reducer;
