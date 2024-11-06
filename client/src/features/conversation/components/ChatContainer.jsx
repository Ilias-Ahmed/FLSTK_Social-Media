import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const selectActiveConversation = createSelector(
  [
    (state) => state.conversation.conversations,
    (state) => state.auth.user?._id,
    (_, conversationId) => conversationId,
  ],
  (conversations, userId, conversationId) => {
    const conversation = conversations.find((c) => c._id === conversationId);
    if (!conversation) return null;

    const otherUser = conversation.participants.find(
      (p) => p.user._id !== userId
    )?.user;

    return { ...conversation, otherUser };
  }
);

export default function ChatContainer() {
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const conversation = useSelector((state) =>
    selectActiveConversation(state, conversationId)
  );

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select a conversation to start chatting
      </div>
    );
  }

  const isOnline =
    conversation.otherUser &&
    conversation.onlineUsers?.[conversation.otherUser._id];

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 p-4 bg-white border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => navigate("/messages")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <Avatar className="w-10 h-10">
          <AvatarImage src={conversation.otherUser?.profilePic} />
          <AvatarFallback>
            {conversation.otherUser?.userName?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <h2 className="font-semibold text-gray-900">
            {conversation.otherUser?.userName}
          </h2>
          <p className="text-sm text-gray-500">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </header>

      <MessageList conversationId={conversationId} />
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
