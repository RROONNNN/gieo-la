"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Socket } from "socket.io-client";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import { getConversations } from "@/lib/api/chat";
import type { ChatMessage } from "@/types/chat";

interface ChatContextValue {
  socket: Socket | null;
  isConnected: boolean;
  totalUnread: number;
  setTotalUnread: (n: number) => void;
  /** ID of the currently open conversation (to suppress unread increment) */
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { socket, isConnected } = useSocket(isAuthenticated);
  const [totalUnread, setTotalUnread] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const activeConvRef = useRef<string | null>(null);

  // Keep ref in sync so socket handlers always see current value
  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  // On mount (when authenticated), fetch initial unread total
  useEffect(() => {
    if (!isAuthenticated) return;
    getConversations()
      .then((convs) => {
        const total = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setTotalUnread(total);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Listen to socket events for live unread updates
  const handleNewMessage = useCallback(
    (message: ChatMessage) => {
      // Only increment if the message is not in the currently active conversation
      if (message.conversationId !== activeConvRef.current) {
        setTotalUnread((prev) => prev + 1);
      }
    },
    [],
  );

  const handleConversationUpdated = useCallback(
    (payload: { conversationId: string; unreadCounts: Record<string, number> }) => {
      // Recalculate total from all unread counts the server sends for this user
      // We don't know the userId here, so just refresh total from server
      getConversations()
        .then((convs) => {
          const total = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setTotalUnread(total);
        })
        .catch(() => {});
    },
    [],
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("new_message", handleNewMessage);
    socket.on("conversation_updated", handleConversationUpdated);
    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("conversation_updated", handleConversationUpdated);
    };
  }, [socket, handleNewMessage, handleConversationUpdated]);

  return (
    <ChatContext.Provider
      value={{
        socket,
        isConnected,
        totalUnread,
        setTotalUnread,
        activeConversationId,
        setActiveConversationId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}
