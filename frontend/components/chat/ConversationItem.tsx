"use client";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}

function truncate(text: string | null | undefined, maxLen: number): string {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

export function ConversationItem({
  conversation,
  isActive,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  const otherUser = conversation.participants.find((p) => p._id !== currentUserId);
  const displayName = otherUser?.name ?? "Người dùng";
  const avatar = otherUser?.avatar;

  const lastMsgPreview = conversation.lastMessage?.content
    ? truncate(conversation.lastMessage.content, 40)
    : "Chưa có tin nhắn";

  const timeAgo = conversation.updatedAt
    ? formatDistanceToNow(new Date(conversation.updatedAt), { locale: vi, addSuffix: true })
    : "";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-light/50",
        isActive && "bg-brand-light border-r-2 border-brand-dark",
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brand-dark/20 flex items-center justify-center text-brand-dark font-semibold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        {conversation.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "text-sm font-medium truncate",
              isActive ? "text-brand-dark" : "text-gray-900",
            )}
          >
            {displayName}
          </span>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo}</span>
        </div>
        <p
          className={cn(
            "text-xs truncate mt-0.5",
            conversation.unreadCount > 0 ? "font-semibold text-gray-800" : "text-gray-500",
          )}
        >
          {lastMsgPreview}
        </p>
      </div>
    </button>
  );
}
