export type MessageType = 'text' | 'image' | 'video' | 'file';

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    name: string;
    avatar: string | null;
  } | null;
  type: MessageType;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileMimeType: string | null;
  isSystem: boolean;
  createdAt: string;
}

export interface ConversationParticipant {
  _id: string;
  name: string;
  avatar: string | null;
  role: string;
  verificationStatus: string;
}

export interface Conversation {
  _id: string;
  participants: ConversationParticipant[];
  lastMessage: {
    content: string | null;
    type: MessageType | null;
    senderId: string | null;
    createdAt: string | null;
  } | null;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}
