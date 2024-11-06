import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { usePostManager } from "../hooks/usePostManager";

const EditPostDialog = ({ post, isOpen, onClose }) => {
  const [caption, setCaption] = useState(post?.caption || "");
  const { updatePost } = usePostManager();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCaption(post?.caption || "");
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("caption", caption);

    try {
      await updatePost(post._id, formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Edit your caption..."
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Post"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;
