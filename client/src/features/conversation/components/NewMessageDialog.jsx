import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/useDebounce";
import { searchUsers, startConversation } from "../api/conversationApi";

export default function NewMessageDialog({ open, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedSearch) {
        setUsers([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const { data } = await searchUsers(debouncedSearch);
        setUsers(data);
      } catch (error) {
        setError("Failed to search users");
        console.error("Error searching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch]);

  const handleUserSelect = async (userId) => {
    try {
      const response = await startConversation(userId);
      navigate(`/messages/${response.data._id}`);
      onClose();
    } catch (error) {
      console.error("Error starting conversation:", error);
      setError("Unable to start conversation. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription id="dialog-description">
            Search for a user to start a conversation.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
          aria-label="Search users"
        />

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Searching...
            </div>
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <button
                key={user._id}
                onClick={() => handleUserSelect(user._id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
                aria-label={`Start conversation with ${user.userName}`}
              >
                <Avatar>
                  <AvatarImage src={user.profilePic} />
                  <AvatarFallback>
                    {user.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.userName}</span>
              </button>
            ))
          ) : (
            <p className="text-center text-muted-foreground p-4">
              {debouncedSearch ? "No users found" : "Start typing to search"}
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
