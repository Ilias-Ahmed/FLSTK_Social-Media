import { useState, useMemo, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePostManager } from "../hooks/usePostManager";
import { Link } from "react-router-dom";
import { createSelector } from "@reduxjs/toolkit";
import EditPostDialog from "./EditPostDialog";

// Ensure bookmarks is always an array in the selector
const selectAuthData = createSelector([(state) => state.auth.user], (user) => ({
  currentUser: user,
  bookmarks: Array.isArray(user?.bookmarks) ? user.bookmarks : [],
}));

const PostCard = ({ post }) => {
  const { currentUser, bookmarks } = useSelector(selectAuthData);
  const [comment, setComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { handleLike, handleBookmark, deletePost, addComment, isLiked } =
    usePostManager(post._id);

  // Safely check if the post is bookmarked
  const isBookmarked = useMemo(() => {
    return (
      Array.isArray(bookmarks) &&
      bookmarks.some(
        (bookmark) => bookmark === post._id || bookmark._id === post._id
      )
    );
  }, [bookmarks, post._id]);

  const isOwnPost = useMemo(
    () => post?.author?._id === currentUser?._id,
    [post?.author?._id, currentUser?._id]
  );

  const displayedComments = useMemo(() => {
    if (!Array.isArray(post?.comments)) return [];
    return showAllComments ? post.comments : post.comments.slice(-2);
  }, [showAllComments, post?.comments]);

  const handleCommentSubmit = useCallback(async () => {
    if (!comment.trim()) return;
    await addComment(post._id, comment);
    setComment("");
  }, [comment, addComment, post._id]);

  const handleDelete = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(post._id);
    }
  }, [deletePost, post._id]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.share({
        title: post.caption,
        url: `${window.location.origin}/posts/${post._id}`,
      });
    } catch (error) {
      console.log("Sharing failed:", error);
    }
  }, [post]);

  const handleEditClick = useCallback(() => {
    setIsEditDialogOpen(true);
  }, []);

  if (!post) return null;

  return (
    <>
      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto bg-card rounded-xl overflow-hidden shadow-lg transition duration-300 hover:shadow-2xl">
        <div className="flex items-center p-4 border-b border-border">
          <Link to={`/profile/${post?.author?._id}`}>
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage
                src={post?.author?.profilePic?.url || "/placeholder.svg"}
                alt={post?.author?.userName}
              />
              <AvatarFallback>{post?.author?.userName?.[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="ml-4 flex-grow">
            <Link
              to={`/profile/${post?.author?._id}`}
              className="text-sm font-semibold hover:underline"
            >
              {post?.author?.userName}
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          {isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditClick}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <img
          className="w-full h-auto max-h-[600px] object-cover"
          src={post?.image?.url}
          alt={post?.caption}
          loading="lazy"
        />

        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleLike(post._id)}
              >
                <Heart
                  className={`h-6 w-6 transition-colors ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button variant="ghost" size="icon">
                <MessageCircle className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Send className="h-6 w-6" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleBookmark(post._id)}
            >
              <Bookmark
                className={`h-6 w-6 transition-colors ${
                  isBookmarked ? "fill-yellow-500 text-yellow-500" : ""
                }`}
              />
            </Button>
          </div>
          <div>
            <span className="font-semibold">
              {post?.likes?.length || 0} likes
            </span>
          </div>
          <div>
            <Link
              to={`/profile/${post?.author?._id}`}
              className="font-semibold mr-2 hover:underline"
            >
              {post?.author?.userName}
            </Link>
            <span>{post?.caption}</span>
          </div>

          {post?.comments?.length > 0 && (
            <div className="space-y-2">
              {post.comments.length > 2 && !showAllComments && (
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setShowAllComments(true)}
                >
                  View all {post.comments.length} comments
                </Button>
              )}
              {displayedComments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-2">
                  <Link
                    to={`/profile/${comment?.user?._id}`}
                    className="font-semibold hover:underline"
                  >
                    {comment?.user?.userName || "Unknown User"}
                  </Link>
                  <span>{comment?.text || ""}</span>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-border mt-3 flex items-center p-4">
            <Input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit()}
              className="flex-grow text-sm border-none bg-transparent"
            />
            <Button
              variant="ghost"
              onClick={handleCommentSubmit}
              disabled={!comment.trim()}
            >
              Post
            </Button>
          </div>
        </div>
      </div>

      <EditPostDialog
        post={post}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </>
  );
};

export default PostCard;
