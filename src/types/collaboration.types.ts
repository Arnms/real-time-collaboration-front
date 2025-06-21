export interface CollaborationUser {
    id: string;
    username: string;
    color: string;
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

export interface OnlineUsersData {
    users: CollaborationUser[];
}
