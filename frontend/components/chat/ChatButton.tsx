"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { getOrCreateConversation } from "@/lib/api/chat";

interface ChatButtonProps {
  profileUserId: string;
}

export function ChatButton({ profileUserId }: ChatButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      const conv = await getOrCreateConversation(profileUserId);
      router.push(`/chat?conv=${conv._id}`);
    } catch {
      // Silently ignore — user will be redirected to chat page
      router.push("/chat");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-lg border border-brand-dark px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-dark hover:text-white transition-colors disabled:opacity-50"
    >
      <MessageSquare className="size-4" />
      {isLoading ? "Đang mở..." : "Nhắn tin"}
    </button>
  );
}
