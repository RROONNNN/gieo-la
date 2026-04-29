"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useChatContext } from "@/contexts/ChatContext";
import { getConversations } from "@/lib/api/chat";
import type { Conversation, ConversationParticipant } from "@/types/chat";
import { ConversationList } from "@/components/chat/ConversationList";
import { MessageThread } from "@/components/chat/MessageThread";
import { UserProfilePanel } from "@/components/chat/UserProfilePanel";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  const { user, isLoading } = useRequireAuth();
  const searchParams = useSearchParams();
  const { socket, setActiveConversationId } = useChatContext();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    getConversations().then(setConversations).catch(() => {});
  }, [user]);

  // Handle ?conv= query param (e.g. coming from profile page)
  useEffect(() => {
    const convId = searchParams.get("conv");
    if (convId) setActiveId(convId);
  }, [searchParams]);

  // Track active conversation in context (for unread suppression)
  useEffect(() => {
    setActiveConversationId(activeId);
    return () => setActiveConversationId(null);
  }, [activeId, setActiveConversationId]);

  // Listen for conversation_updated to refresh list
  const handleConversationUpdated = useCallback(
    (payload: { conversationId: string; lastMessage: unknown; unreadCounts: Record<string, number> }) => {
      setConversations((prev) =>
        prev
          .map((conv) => {
            if (conv._id !== payload.conversationId) return conv;
            const unreadCount =
              user ? (payload.unreadCounts[user._id] ?? 0) : 0;
            return {
              ...conv,
              lastMessage: payload.lastMessage as Conversation["lastMessage"],
              unreadCount,
              updatedAt: new Date().toISOString(),
            };
          })
          .sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      );
    },
    [user],
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("conversation_updated", handleConversationUpdated);
    return () => { socket.off("conversation_updated", handleConversationUpdated); };
  }, [socket, handleConversationUpdated]);

  function handleSelectConversation(id: string) {
    setActiveId(id);
    setIsProfileOpen(false);
    // Mark as read in the list immediately
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c)),
    );
  }

  const activeConversation = conversations.find((c) => c._id === activeId);
  const otherUser = activeConversation?.participants.find((p) => p._id !== user?._id);

  function handleOpenProfile() {
    if (!otherUser) return;
    setProfileUserId(otherUser._id);
    setIsProfileOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] text-gray-400">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#FDFAF5]">
      {/* Conversation List — fixed width */}
      <div className="w-80 flex-shrink-0 h-full overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          currentUserId={user?._id ?? ""}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Message Thread */}
      <div className="flex-1 h-full overflow-hidden">
        {activeId && otherUser ? (
          <MessageThread
            key={activeId}
            conversationId={activeId}
            otherUser={otherUser as ConversationParticipant}
            onOpenProfile={handleOpenProfile}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
            <MessageSquare className="w-12 h-12 opacity-30" />
            <p className="text-sm">Chọn một cuộc hội thoại để bắt đầu</p>
          </div>
        )}
      </div>

      {/* Profile Panel */}
      {isProfileOpen && profileUserId && (
        <div className="w-72 flex-shrink-0 h-full overflow-hidden">
          <UserProfilePanel
            userId={profileUserId}
            onClose={() => setIsProfileOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
