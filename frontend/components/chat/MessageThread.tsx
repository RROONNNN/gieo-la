"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMessages, markRead, uploadChatFile } from "@/lib/api/chat";
import type { ChatMessage, ConversationParticipant } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useChatContext } from "@/contexts/ChatContext";
import { useAuth } from "@/hooks/useAuth";

interface MessageThreadProps {
  conversationId: string;
  otherUser: ConversationParticipant;
  onOpenProfile: () => void;
}

export function MessageThread({
  conversationId,
  otherUser,
  onOpenProfile,
}: MessageThreadProps) {
  const { user } = useAuth();
  const { socket } = useChatContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load initial messages and mark as read
  useEffect(() => {
    setIsLoading(true);
    setMessages([]);
    getMessages(conversationId, { limit: 30 })
      .then(({ messages: msgs, hasMore: more }) => {
        setMessages(msgs);
        setHasMore(more);
      })
      .finally(() => setIsLoading(false));

    markRead(conversationId).catch(() => {});
    socket?.emit("mark_read", { conversationId });
  }, [conversationId, socket]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for new socket messages
  const handleNewMessage = useCallback(
    (message: ChatMessage) => {
      if (message.conversationId !== conversationId) return;
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
      markRead(conversationId).catch(() => {});
      socket?.emit("mark_read", { conversationId });
    },
    [conversationId, socket],
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("new_message", handleNewMessage);
    return () => { socket.off("new_message", handleNewMessage); };
  }, [socket, handleNewMessage]);

  async function loadMore() {
    if (!messages.length || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const { messages: older, hasMore: more } = await getMessages(conversationId, {
        limit: 30,
        before: messages[0]._id,
      });
      setMessages((prev) => [...older, ...prev]);
      setHasMore(more);
    } finally {
      setIsLoadingMore(false);
    }
  }

  function handleSendText(text: string) {
    if (!socket) return;
    socket.emit(
      "send_message",
      { conversationId, type: "text", content: text },
      (ack: { success: boolean; message?: ChatMessage }) => {
        if (ack?.success && ack.message) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === ack.message!._id)) return prev;
            return [...prev, ack.message!];
          });
        }
      },
    );
  }

  async function handleSendFile(file: File) {
    const uploaded = await uploadChatFile(file);
    const type = uploaded.fileMimeType.startsWith("image/")
      ? "image"
      : uploaded.fileMimeType.startsWith("video/")
        ? "video"
        : "file";
    socket?.emit(
      "send_message",
      {
        conversationId,
        type,
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
        fileMimeType: uploaded.fileMimeType,
      },
      (ack: { success: boolean; message?: ChatMessage }) => {
        if (ack?.success && ack.message) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === ack.message!._id)) return prev;
            return [...prev, ack.message!];
          });
        }
      },
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-light bg-white">
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {otherUser.avatar ? (
            <img
              src={otherUser.avatar}
              alt={otherUser.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-dark/20 flex items-center justify-center text-brand-dark font-semibold text-sm">
              {otherUser.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-gray-900">{otherUser.name}</span>
        </button>
        <button
          onClick={onOpenProfile}
          className="ml-auto p-2 text-gray-400 hover:text-brand-dark transition-colors"
          title="Xem hồ sơ"
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#FDFAF5]">
        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-1 text-xs text-brand-dark hover:underline disabled:opacity-50"
            >
              <ChevronUp className="w-3 h-3" />
              {isLoadingMore ? "Đang tải..." : "Tải tin nhắn cũ hơn"}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8 text-sm text-gray-400">Đang tải...</div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex justify-center py-8 text-sm text-gray-400">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.sender?._id === user?._id}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendText={handleSendText}
        onSendFile={handleSendFile}
        disabled={!socket}
      />
    </div>
  );
}
