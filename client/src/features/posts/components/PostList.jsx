import { usePostManager } from "../hooks/usePostManager";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

const PostList = () => {
  const {
    posts,
    isLoading,
    error,
    loadPosts,
    pagination: { currentPage, totalPages },
  } = usePostManager();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading posts: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
      {currentPage < totalPages && (
        <div className="text-center">
          <Button variant="outline" onClick={() => loadPosts(currentPage + 1)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostList;
