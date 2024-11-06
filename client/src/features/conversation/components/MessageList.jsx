import React, { useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchMessages } from "../slices/conversationSlice";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { createSelector } from "@reduxjs/toolkit";

// Selectors to memoize messages and typing users
const selectMessagesData = createSelector(
  [
    (state) => state.conversation.messages,
    (_, conversationId) => conversationId,
  ],
  (messages, conversationId) => messages[conversationId] || []
);

const selectTypingUsers = createSelector(
  [
    (state) => state.conversation.typingUsers,
    (_, conversationId) => conversationId,
  ],
  (typingUsers, conversationId) => typingUsers[conversationId] || {}
);

// Utility function to group messages by date and sender
const groupMessagesByDateAndSender = (messages) => {
  if (!messages?.length) return [];

  const groups = [];
  let currentDate = null;
  let currentSender = null;
  let currentMessages = [];

  messages.forEach((message) => {
    const messageDate = format(new Date(message.createdAt), "yyyy-MM-dd");

    if (messageDate !== currentDate || message.senderId !== currentSender) {
      if (currentMessages.length) {
        groups.push({
          date: currentDate,
          senderId: currentSender,
          messages: currentMessages,
        });
      }
      currentDate = messageDate;
      currentSender = message.senderId;
      currentMessages = [message];
    } else {
      currentMessages.push(message);
    }
  });

  if (currentMessages.length) {
    groups.push({
      date: currentDate,
      senderId: currentSender,
      messages: currentMessages,
    });
  }

  return groups;
};

// DateDivider component
const DateDivider = ({ date }) => {
  if (!date) return null;

  const displayDate = isToday(new Date(date))
    ? "Today"
    : isYesterday(new Date(date))
    ? "Yesterday"
    : format(new Date(date), "MMMM d, yyyy");

  return (
    <div className="flex items-center justify-center my-4">
      <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full border">
        {displayDate}
      </span>
    </div>
  );
};

// MessageGroup component
const MessageGroup = ({ messages, isOwn, isLastGroup }) => {
  const lastMessage = messages[messages.length - 1];

  return (
    <div
      className={cn(
        "flex flex-col space-y-2 max-w-[70%]",
        isOwn ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      {messages.map((message, index) => (
        <div
          key={message._id}
          className={cn(
            "rounded-lg px-4 py-2 relative",
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
            index === messages.length - 1 && "mb-1"
          )}
        >
          {message.message}
          {isOwn && isLastGroup && index === messages.length - 1 && (
            <span className="absolute -bottom-5 right-0 text-xs text-muted-foreground">
              {message.readBy?.length > 1 ? "Seen" : "Delivered"}
            </span>
          )}
        </div>
      ))}
      <span className="text-xs text-muted-foreground">
        {format(new Date(lastMessage.createdAt), "HH:mm")}
      </span>
    </div>
  );
};

// Main MessageList component
export default function MessageList({ conversationId }) {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  const currentUserId = useSelector((state) => state.auth.user?._id);
  const messages = useSelector((state) =>
    selectMessagesData(state, conversationId)
  );
  const typingUsers = useSelector((state) =>
    selectTypingUsers(state, conversationId)
  );
  const isLoading = useSelector((state) => state.conversation.isLoading);

  // Fetch messages on mount or when conversationId changes
  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages(conversationId));
    }
  }, [conversationId, dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const shouldScroll =
      scrollRef.current &&
      scrollRef.current.scrollHeight - scrollRef.current.scrollTop < 1000;

    if (shouldScroll) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Memoized message grouping
  const messageGroups = useMemo(
    () => groupMessagesByDateAndSender(messages),
    [messages]
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-muted-foreground">Loading messages...</span>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
      <div className="flex flex-col p-4">
        {messageGroups.map((group, index) => (
          <React.Fragment key={`group-${group.date}-${index}`}>
            {(index === 0 || group.date !== messageGroups[index - 1].date) && (
              <DateDivider key={`date-${group.date}`} date={group.date} />
            )}
            <MessageGroup
              messages={group.messages}
              isOwn={group.senderId === currentUserId}
            />
          </React.Fragment>
        ))}
        {Object.keys(typingUsers).length > 0 && (
          <div className="text-sm text-muted-foreground mt-2">
            Someone is typing...
          </div>
        )}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}
