export interface CollaborationUser {
  id: string;
  username: string;
  color: string;
  isTyping?: boolean;
  cursorPosition?: number;
}

export interface TextOperation {
  type: "insert" | "delete" | "retain";
  position: number;
  content?: string;
  length?: number;
  attributes?: Record<string, any>;
}

export interface CursorPosition {
  position: number;
  selection?: {
    start: number;
    end: number;
  };
}

export interface DocumentJoinedData {
  document: {
    id: string;
    title: string;
    content: string;
    version: number;
  };
  user: CollaborationUser;
  permission: string;
}

export interface TextChangedData {
  operation: TextOperation;
  version: number;
  author: CollaborationUser;
  timestamp: string;
}

export interface CursorMovedData {
  user: CollaborationUser;
  position: number;
  selection?: { start: number; end: number };
  timestamp: string;
}

export interface UserJoinedData {
  user: CollaborationUser;
}

export interface UserLeftData {
  user: Pick<CollaborationUser, "id" | "username">;
}

export interface OnlineUsersData {
  users: CollaborationUser[];
}

export interface TypingStatusData {
  user: CollaborationUser;
  isTyping: boolean;
  timestamp: string;
}

// WebSocket 이벤트 타입들
export interface ClientToServerEvents {
  "join-document": (data: { documentId: string; token: string }) => void;
  "leave-document": (data: { documentId: string }) => void;
  "text-change": (data: {
    documentId: string;
    operation: TextOperation;
    version: number;
  }) => void;
  "cursor-position": (data: {
    documentId: string;
    position: number;
    selection?: { start: number; end: number };
  }) => void;
  "typing-status": (data: { documentId: string; isTyping: boolean }) => void;
}

export interface ServerToClientEvents {
  "document-joined": (data: DocumentJoinedData) => void;
  "user-joined": (data: UserJoinedData) => void;
  "user-left": (data: UserLeftData) => void;
  "online-users": (data: OnlineUsersData) => void;
  "text-changed": (data: TextChangedData) => void;
  "cursor-moved": (data: CursorMovedData) => void;
  "typing-status-changed": (data: TypingStatusData) => void;
  error: (data: { message: string }) => void;
}
