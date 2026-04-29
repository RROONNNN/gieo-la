import { apiClient } from "./client";
import { ENDPOINTS, BASE_URL } from "./endpoints";
import type { Conversation, ChatMessage } from "@/types/chat";

const TOKEN_KEY = "la_lanh_token";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export async function getConversations(): Promise<Conversation[]> {
  const data = await apiClient.get<{ conversations: Conversation[] }>(
    ENDPOINTS.CHAT.CONVERSATIONS,
  );
  return data.data?.conversations ?? [];
}

export async function getOrCreateConversation(
  participantId: string,
): Promise<Conversation> {
  const data = await apiClient.post<{ conversation: Conversation }>(
    ENDPOINTS.CHAT.CONVERSATIONS,
    { participantId },
  );
  return data.data!.conversation;
}

export async function getMessages(
  conversationId: string,
  params?: { limit?: number; before?: string },
): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.before) query.set("before", params.before);

  const qs = query.toString() ? `?${query.toString()}` : "";
  const data = await apiClient.get<{ messages: ChatMessage[]; hasMore: boolean }>(
    `${ENDPOINTS.CHAT.CONVERSATION_MESSAGES(conversationId)}${qs}`,
  );
  return { messages: data.data?.messages ?? [], hasMore: data.data?.hasMore ?? false };
}

export async function markRead(conversationId: string): Promise<void> {
  await apiClient.patch(ENDPOINTS.CHAT.CONVERSATION_READ(conversationId));
}

export interface UploadedFile {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
}

export async function uploadChatFile(file: File): Promise<UploadedFile> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${ENDPOINTS.CHAT.UPLOAD}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Tải file lên thất bại");
  }

  return data.data as UploadedFile;
}
