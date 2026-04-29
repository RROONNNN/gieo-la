"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import type { Conversation } from "@/types/chat";
import { ConversationItem } from "./ConversationItem";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  currentUserId: string;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  currentUserId,
  onSelect,
}: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const other = conv.participants.find((p) => p._id !== currentUserId);
    return other?.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full border-r border-brand-light">
      {/* Header */}
      <div className="px-4 py-4 border-b border-brand-light">
        <h2 className="font-heading text-lg font-bold text-brand-dark mb-3">Tin nhắn</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-brand-light rounded-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-gray-400">
            {search ? "Không tìm thấy cuộc hội thoại" : "Chưa có cuộc hội thoại nào"}
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
              isActive={conv._id === activeId}
              currentUserId={currentUserId}
              onClick={() => onSelect(conv._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
