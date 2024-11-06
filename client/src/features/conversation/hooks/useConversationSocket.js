import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSocketConnection } from "@/lib/api/client";
import {
  addMessage,
  updateOnlineStatus,
  setTypingStatus,
} from "../slices/conversationSlice";

export const useConversationSocket = () => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;

    socketRef.current = createSocketConnection();

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
    });

    socketRef.current.on("newMessage", (data) => {
      dispatch(addMessage(data));
    });

    socketRef.current.on(
      "userTyping",
      ({ conversationId, userId, isTyping }) => {
        dispatch(setTypingStatus({ conversationId, userId, isTyping }));
      }
    );

    socketRef.current.on("onlineStatusResponse", (statuses) => {
      dispatch(updateOnlineStatus(statuses));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, dispatch]);

  return socketRef.current;
};
