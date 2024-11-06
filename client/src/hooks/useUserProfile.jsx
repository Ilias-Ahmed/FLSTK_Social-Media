import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../features/profile/slices/profileSlice";

export const useUserProfile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.profile);
  const [posts, setPosts] = useState([]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await dispatch(fetchUserProfile());
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [dispatch]);

  // Sync posts when user data changes
  useEffect(() => {
    if (user?.posts) {
      setPosts(user.posts);
    }
  }, [user]);

  // Memoized refetch function
  const refetchProfile = useCallback(async () => {
    try {
      await dispatch(fetchUserProfile());
    } catch (error) {
      console.error("Failed to refetch profile:", error);
    }
  }, [dispatch]);

  return {
    user,
    posts,
    isLoading,
    error,
    refetchProfile,
    isProfileEmpty: !user,
    hasError: !!error,
  };
};
