import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePostActions } from "../hooks/usePostActions";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";

const PostComments = ({ post, currentUser }) => {
  const [showAllComments, setShowAllComments] = useState(false);
  const { deleteComment } = usePostActions();

  const displayedComments = showAllComments
    ? post.comments
    : post.comments.slice(-2);

  return (
    <div className="space-y-2">
      {post.comments.length > 2 && !showAllComments && (
        <Button variant="link" onClick={() => setShowAllComments(true)}>
          View all {post.comments.length} comments
        </Button>
      )}

      {displayedComments.map((comment) => (
        <div key={comment._id} className="flex items-start space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.user.profilePic?.url} />
            <AvatarFallback>{comment.user.userName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-semibold">{comment.user.userName}</span>{" "}
              {comment.text}
            </p>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          {(currentUser._id === comment.user._id ||
            currentUser._id === post.author._id) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteComment(post._id, comment._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostComments;
