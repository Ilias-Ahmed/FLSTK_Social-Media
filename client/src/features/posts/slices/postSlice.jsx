import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as postApi from "../api/postApi";
import { toast } from "sonner";

// Helper function to handle rejections
const handleReject = (error) => {
  const message = error.response?.data?.message || error.message;
  return { message, success: false };
};

const initialState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalPosts: 0,
};

// Async Thunks
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await postApi.getPosts(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postApi.getPost(postId);
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const createNewPost = createAsyncThunk(
  "posts/createPost",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await postApi.createPost(formData);
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const updateExistingPost = createAsyncThunk(
  "posts/updatePost",
  async ({ postId, formData }, { rejectWithValue }) => {
    try {
      const response = await postApi.updatePost(postId, formData);
      return response;
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const removePost = createAsyncThunk(
  "posts/removePost",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postApi.deletePost(postId);
      return { ...response, postId };
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const togglePostLike = createAsyncThunk(
  "posts/toggleLike",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postApi.likePost(postId);
      return { ...response, postId };
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const togglePostBookmark = createAsyncThunk(
  "posts/toggleBookmark",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postApi.bookmarkPost(postId);
      return { ...response, postId };
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const addPostComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const response = await postApi.addComment(postId, text);
      return { ...response, postId };
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

export const removeComment = createAsyncThunk(
  "posts/removeComment",
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      const response = await postApi.deleteComment(postId, commentId);
      return { ...response, postId, commentId };
    } catch (error) {
      return rejectWithValue(handleReject(error));
    }
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPostError: (state) => {
      state.error = null;
    },
    resetPosts: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalPosts = action.payload.totalPosts;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
        toast.error(action.payload.message);
      })
      // Fetch Post By Id
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload.post;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
        toast.error(action.payload.message);
      })
      // Create Post
      .addCase(createNewPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload.post);
        toast.success(action.payload.message);
      })
      .addCase(createNewPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
        toast.error(action.payload.message);
      })
      // Update Post
      .addCase(updateExistingPost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(
          (post) => post._id === action.payload.post._id
        );
        if (index !== -1) {
          state.posts[index] = action.payload.post;
        }
        if (state.currentPost?._id === action.payload.post._id) {
          state.currentPost = action.payload.post;
        }
        toast.success(action.payload.message);
      })
      .addCase(updateExistingPost.rejected, (state, action) => {
        state.error = action.payload.message;
        toast.error(action.payload.message);
      })
      // Delete Post
      .addCase(removePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(
          (post) => post._id !== action.payload.postId
        );
        toast.success(action.payload.message);
      })
      .addCase(removePost.rejected, (state, action) => {
        state.error = action.payload.message;
        toast.error(action.payload.message);
      })
      // Toggle Like
      .addCase(togglePostLike.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.likes = action.payload.likes;
        }
        if (state.currentPost?._id === action.payload.postId) {
          state.currentPost.likes = action.payload.likes;
        }
        toast.success(action.payload.message);
      })
      .addCase(togglePostLike.rejected, (state, action) => {
        toast.error(action.payload.message);
      })
      // Toggle Bookmark
      .addCase(togglePostBookmark.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.isBookmarked = action.payload.isBookmarked;
        }
        if (state.currentPost?._id === action.payload.postId) {
          state.currentPost.isBookmarked = action.payload.isBookmarked;
        }
        toast.success(action.payload.message);
      })
      .addCase(togglePostBookmark.rejected, (state, action) => {
        toast.error(action.payload.message);
      })
      // Add Comment
      .addCase(addPostComment.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.comments = action.payload.comments;
        }
        if (state.currentPost?._id === action.payload.postId) {
          state.currentPost.comments = action.payload.comments;
        }
        toast.success(action.payload.message);
      })
      .addCase(addPostComment.rejected, (state, action) => {
        toast.error(action.payload.message);
      })
      // Remove Comment
      .addCase(removeComment.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.comments = post.comments.filter(
            (c) => c._id !== action.payload.commentId
          );
        }
        if (state.currentPost?._id === action.payload.postId) {
          state.currentPost.comments = state.currentPost.comments.filter(
            (c) => c._id !== action.payload.commentId
          );
        }
        toast.success(action.payload.message);
      })
      .addCase(removeComment.rejected, (state, action) => {
        toast.error(action.payload.message);
      });
  },
});

export const { clearPostError, resetPosts } = postSlice.actions;
export default postSlice.reducer;
