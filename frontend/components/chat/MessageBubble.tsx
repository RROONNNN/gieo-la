"use client";

import { Download, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const timeStr = format(new Date(message.createdAt), "HH:mm", { locale: vi });

  // System message — centered italic, optionally linking to a post
  if (message.isSystem) {
    const postId = message.metadata?.postId;
    return (
      <div className="flex justify-center my-2">
        {postId ? (
          <Link
            href={`/posts/${postId}`}
            className="group flex items-center gap-1.5 text-xs text-brand-dark italic bg-brand-light/40 border border-brand-light rounded-[15px] px-3 py-1.5 max-w-xs text-center hover:bg-brand-light/70 transition-colors"
          >
            <span>{message.content}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60 group-hover:opacity-100" />
          </Link>
        ) : (
          <span className="text-xs text-gray-500 italic bg-gray-100 rounded-[15px] px-3 py-1 max-w-xs text-center">
            {message.content}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex mb-3", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[70%]", isOwn ? "items-end" : "items-start", "flex flex-col")}>
        {/* Text bubble */}
        {message.type === "text" && (
          <div
            className={cn(
              "rounded-[15px] px-4 py-2 text-sm",
              isOwn
                ? "bg-brand-dark text-white rounded-br-sm"
                : "bg-white border border-brand-light text-gray-900 rounded-bl-sm",
            )}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        )}

        {/* Image */}
        {message.type === "image" && message.fileUrl && (
          <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={message.fileUrl}
              alt={message.fileName || "Ảnh"}
              className="max-w-[240px] rounded-[15px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
            />
          </a>
        )}

        {/* Video */}
        {message.type === "video" && message.fileUrl && (
          <video
            src={message.fileUrl}
            controls
            className="max-w-[320px] rounded-[15px]"
          />
        )}

        {/* File download card */}
        {message.type === "file" && message.fileUrl && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={message.fileName || true}
            className={cn(
              "flex items-center gap-3 rounded-[15px] px-4 py-3 border transition-colors hover:opacity-80",
              isOwn
                ? "bg-brand-dark text-white border-brand-dark"
                : "bg-white border-brand-light text-gray-900",
            )}
          >
            <FileText className="w-8 h-8 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate max-w-[160px]">
                {message.fileName || "File đính kèm"}
              </p>
              {message.fileSize && (
                <p className={cn("text-xs", isOwn ? "text-white/70" : "text-gray-400")}>
                  {formatFileSize(message.fileSize)}
                </p>
              )}
            </div>
            <Download className="w-4 h-4 flex-shrink-0" />
          </a>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 mt-1">{timeStr}</span>
      </div>
    </div>
  );
}
