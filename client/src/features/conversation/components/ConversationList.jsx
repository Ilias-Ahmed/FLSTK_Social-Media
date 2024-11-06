import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useState, useCallback } from "react";
import NewMessageDialog from "./NewMessageDialog";

// Selectors
const selectRawConversations = (state) => state.conversation.conversations;
const selectCurrentUserId = (state) => state.auth.user?._id;
const selectOnlineUsers = (state) => state.conversation.onlineUsers;

const selectFormattedConversations = createSelector(
  [selectRawConversations, selectCurrentUserId, selectOnlineUsers],
  (conversations, currentUserId, onlineUsers) => {
    if (!conversations) return [];

    return conversations
      .map((conversation) => {
        const otherParticipant = conversation.participants.find(
          (p) => p.user._id !== currentUserId
        )?.user;

        return {
          ...conversation,
          otherParticipant,
          isOnline: otherParticipant
            ? onlineUsers[otherParticipant._id]
            : false,
          lastMessagePreview:
            conversation.lastMessage?.message || "Start a conversation",
          lastMessageTime: conversation.lastMessage?.createdAt,
        };
      })
      .sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
  }
);

export default function ConversationList() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const conversations = useSelector(selectFormattedConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.otherParticipant?.userName
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setSearchQuery("");
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Messages</h2>
          <Button size="sm" onClick={() => setShowNewMessage(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 px-2">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? "No conversations found" : "No messages yet"}
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation._id}
                onClick={() => navigate(`/messages/${conversation._id}`)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
                  hover:bg-accent hover:shadow-sm 
                  active:scale-95 focus-visible:outline-none 
                  focus-visible:ring-2 focus-visible:ring-ring ${
                    conversation._id === conversationId
                      ? "bg-accent/80 shadow-sm"
                      : ""
                  }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage
                      src={conversation.otherParticipant.profilePic}
                      className="object-cover"
                    />
                    <AvatarFallback className="font-medium">
                      {conversation.otherParticipant.userName
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline">
                    <p className="font-medium truncate">
                      {conversation.otherParticipant.userName}
                    </p>
                    {conversation.lastMessageTime && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          conversation.lastMessageTime
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessagePreview}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
      <NewMessageDialog
        open={showNewMessage}
        onClose={() => setShowNewMessage(false)}
      />
    </div>
  );
}
