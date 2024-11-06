import { useEffect, memo } from "react";
import { useDispatch } from "react-redux";
import { SuggestedUsers } from "@/features/user/components/SuggestedUser";
import PostCard from "@/features/posts/components/PostCard";
import Loader from "@/components/common/Loader";
import { usePostManager } from "@/features/posts/hooks/usePostManager";
import CreatePostDialog from "@/features/posts/components/CreatePostDialog";
import { loadUserFromStorage } from "@/features/auth/slices/authSlice";
import { Button } from "@/components/ui/button";

const LoadingState = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Loader />
  </div>
);

const ErrorState = ({ message }) => (
  <div className="text-center text-red-500 p-4">
    Error loading posts: {message}
  </div>
);

const PostList = memo(({ posts }) => (
  <div className="space-y-6">
    {posts?.map((post) => (
      <PostCard key={post._id} post={post} />
    ))}
  </div>
));

const LoadMoreButton = ({ onClick, isLoading }) => (
  <Button
    onClick={onClick}
    className="w-full"
    disabled={isLoading}
    variant="primary"
  >
    {isLoading ? "Loading..." : "Load More"}
  </Button>
);

const HomePage = () => {
  const dispatch = useDispatch();
  const { posts, isLoading, error, loadPosts, currentPage, totalPages } =
    usePostManager();

  useEffect(() => {
    loadPosts();
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch, loadPosts]);

  const handleLoadMore = () => {
    loadPosts(currentPage + 1);
  };

  if (isLoading && !posts.length) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-grow space-y-6">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Home</h1>
            <CreatePostDialog />
          </header>

          <PostList posts={posts} />

          {currentPage < totalPages && (
            <div className="text-center py-4">
              <LoadMoreButton onClick={handleLoadMore} isLoading={isLoading} />
            </div>
          )}
        </main>

        <aside className="lg:w-80">
          <div className="sticky top-4">
            <SuggestedUsers />
          </div>
        </aside>
      </div>
    </div>
  );
};

PostList.displayName = "PostList";
HomePage.displayName = "HomePage";

export default HomePage;
