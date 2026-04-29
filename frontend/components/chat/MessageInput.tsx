"use client";

import { Paperclip, Send, X } from "lucide-react";
import { useRef, useState, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendText: (text: string) => void;
  onSendFile: (file: File) => Promise<void>;
  disabled?: boolean;
}

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;  // 20 MB

function getMaxSize(mime: string): number {
  if (mime.startsWith("image/")) return MAX_IMAGE_SIZE;
  if (mime.startsWith("video/")) return MAX_VIDEO_SIZE;
  return MAX_FILE_SIZE;
}

export function MessageInput({ onSendText, onSendFile, disabled }: MessageInputProps) {
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!e.nativeEvent.isComposing) {
        handleSend();
      }
    }
  }

  function handleSend() {
    if (disabled) return;
    if (pendingFile) {
      handleSendFile();
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  async function handleSendFile() {
    if (!pendingFile) return;
    setIsSendingFile(true);
    try {
      await onSendFile(pendingFile);
      setPendingFile(null);
    } finally {
      setIsSendingFile(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = getMaxSize(file.type);
    if (file.size > maxSize) {
      setFileError(`File vượt quá dung lượng cho phép (${maxSize / 1024 / 1024} MB)`);
      e.target.value = "";
      return;
    }
    setPendingFile(file);
    e.target.value = "";
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  const canSend = !disabled && !isSendingFile && (text.trim().length > 0 || pendingFile !== null);

  return (
    <div className="border-t border-brand-light bg-white px-4 py-3">
      {/* File error */}
      {fileError && (
        <p className="text-xs text-red-500 mb-2">{fileError}</p>
      )}

      {/* Pending file chip */}
      {pendingFile && (
        <div className="flex items-center gap-2 mb-2 bg-brand-light/50 rounded-[15px] px-3 py-2 text-sm">
          <Paperclip className="w-4 h-4 text-brand-dark flex-shrink-0" />
          <span className="truncate flex-1 text-gray-700">{pendingFile.name}</span>
          <button
            onClick={() => setPendingFile(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* File attach button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-brand-dark transition-colors disabled:opacity-40"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        {!pendingFile && (
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Nhập tin nhắn..."
            className="flex-1 resize-none border border-brand-light rounded-[15px] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 disabled:opacity-40 max-h-[120px]"
          />
        )}

        {/* Placeholder for file mode */}
        {pendingFile && <div className="flex-1" />}

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "flex-shrink-0 p-2 rounded-full transition-colors",
            canSend
              ? "bg-brand-dark text-white hover:bg-brand-dark/90"
              : "bg-gray-200 text-gray-400 cursor-not-allowed",
          )}
        >
          {isSendingFile ? (
            <span className="w-5 h-5 block border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
