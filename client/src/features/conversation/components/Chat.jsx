import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ConversationList from "../components/ConversationList";
import ChatContainer from "../components/ChatContainer";
import { cn } from "@/lib/utils";
import { fetchConversations } from "../slices/conversationSlice";

export default function Chat() {
  const { conversationId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-2rem)] bg-white rounded-lg border shadow-sm">
      {/* Sidebar for Conversation List */}
      <aside
        className={cn(
          "border-r bg-gray-50",
          conversationId
            ? "hidden md:block md:w-[350px]"
            : "w-full md:w-[350px]"
        )}
      >
        <ConversationList />
      </aside>

      {/* Main Chat Container */}
      <main className={cn("flex-1", !conversationId && "hidden md:flex")}>
        <ChatContainer />
      </main>
    </div>
  );
}
