import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPosts,
  fetchPostById,
  createNewPost,
  removePost,
  updateExistingPost,
  addPostComment,
  removeComment,
  togglePostLike,
  togglePostBookmark,
} from "../slices/postSlice";
import { updateUserBookmarks } from "@/features/auth/slices/authSlice";

export const usePostManager = (postId = null) => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);
  const posts = useSelector((state) => state.posts.posts);
  const currentPost = useSelector((state) => state.posts.currentPost);
  const isLoading = useSelector((state) => state.posts.isLoading);
  const error = useSelector((state) => state.posts.error);
  const currentPage = useSelector((state) => state.posts.currentPage);
  const totalPages = useSelector((state) => state.posts.totalPages);

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const targetPost = postId
    ? posts.find((p) => p._id === postId) || currentPost
    : null;

  useEffect(() => {
    if (targetPost && currentUser) {
      // For likes - check if user's ID exists in post's likes array
      const postLikes = targetPost.likes || [];
      const userHasLiked = postLikes.some(
        (like) => like === currentUser._id || like._id === currentUser._id
      );
      setIsLiked(userHasLiked);

      // For bookmarks - ensure `userBookmarks` is always an array
      const userBookmarks = Array.isArray(currentUser.bookmarks)
        ? currentUser.bookmarks
        : [];
      const userHasBookmarked = userBookmarks.some(
        (bookmark) =>
          bookmark === targetPost._id || bookmark._id === targetPost._id
      );
      setIsBookmarked(userHasBookmarked);
    }
  }, [targetPost, currentUser]);

  const handleBookmark = useCallback(
    async (id) => {
      if (!currentUser) return;
      try {
        const response = await dispatch(togglePostBookmark(id)).unwrap();
        // Convert response bookmarks to strings
        const bookmarkIds = response.bookmarks.map((bookmark) =>
          typeof bookmark === "string" ? bookmark : bookmark._id
        );
        setIsBookmarked(bookmarkIds.includes(id));
        dispatch(updateUserBookmarks(response.bookmarks));
      } catch (error) {
        console.error("Bookmark error:", error);
      }
    },
    [dispatch, currentUser]
  );

  const handleLike = useCallback(
    async (id) => {
      if (!currentUser) return;
      try {
        const response = await dispatch(togglePostLike(id)).unwrap();
        setIsLiked(response.isLiked);
      } catch (error) {
        console.error("Like error:", error);
      }
    },
    [dispatch, currentUser]
  );

  // Your existing action handlers
  const loadPosts = useCallback(
    (page = 1, limit = 10) => {
      dispatch(fetchPosts({ page, limit }));
    },
    [dispatch]
  );

  const loadPostDetails = useCallback(() => {
    if (postId) dispatch(fetchPostById(postId));
  }, [dispatch, postId]);

  const createPost = useCallback(
    (formData) => {
      return dispatch(createNewPost(formData)).unwrap();
    },
    [dispatch]
  );

  const deletePost = useCallback(
    (id) => {
      return dispatch(removePost(id)).unwrap();
    },
    [dispatch]
  );

  const updatePost = useCallback(
    (id, formData) => {
      return dispatch(updateExistingPost({ postId: id, formData })).unwrap();
    },
    [dispatch]
  );

  const addComment = useCallback(
    (id, text) => {
      return dispatch(addPostComment({ postId: id, text })).unwrap();
    },
    [dispatch]
  );

  const deleteComment = useCallback(
    (id, commentId) => {
      return dispatch(removeComment({ postId: id, commentId })).unwrap();
    },
    [dispatch]
  );

  return {
    posts,
    currentPost: targetPost,
    isLoading,
    error,
    currentPage,
    totalPages,
    isLiked,
    isBookmarked,
    loadPosts,
    loadPostDetails,
    createPost,
    deletePost,
    updatePost,
    addComment,
    deleteComment,
    handleLike,
    handleBookmark,
  };
};
