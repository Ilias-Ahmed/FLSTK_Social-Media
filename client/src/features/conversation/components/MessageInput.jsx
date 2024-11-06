import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { sendNewMessage } from "../slices/conversationSlice";
import { useConversationSocket } from "../hooks/useConversationSocket";
import { createSelector } from "@reduxjs/toolkit";

const selectConversationData = createSelector(
  [
    (state) => state.conversation.conversations,
    (_, conversationId) => conversationId,
    (state) => state.auth.user?._id,
  ],
  (conversations, conversationId, currentUserId) => {
    const conversation = conversations.find((c) => c._id === conversationId);
    const receiverId = conversation?.participants.find(
      (p) => p.user._id !== currentUserId
    )?.user._id;
    return { receiverId };
  }
);

export default function MessageInput({ conversationId }) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const socket = useConversationSocket();
  const { receiverId } = useSelector((state) =>
    selectConversationData(state, conversationId)
  );

  // Handle typing indication with useCallback to prevent function re-creation
  const handleTyping = useCallback(() => {
    if (!isTyping && socket && receiverId) {
      setIsTyping(true);
      socket.emit("typing", {
        conversationId,
        receiverId,
        isTyping: true,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socket && receiverId) {
        setIsTyping(false);
        socket.emit("typing", {
          conversationId,
          receiverId,
          isTyping: false,
        });
      }
    }, 1000);
  }, [isTyping, socket, conversationId, receiverId]);

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const messageData = { conversationId, message: trimmedMessage, receiverId };
    try {
      await dispatch(sendNewMessage(messageData)).unwrap();
      setMessage("");
    } catch (error) {
      // Handle potential errors
    }
  };

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="min-h-[20px] max-h-[120px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={!message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
