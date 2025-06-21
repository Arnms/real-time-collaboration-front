import { User } from "./auth.types";

export interface Document {
    id: string;
    title: string;
    content: string;
    metadata?: {
        theme?: string;
        fontSize?: number;
        fontFamily?: string;
        tags?: string[];
        [key: string]: any;
    };
    version: number;
    isPublic: boolean;
    isTemplate: boolean;
    templateCategory?: string;
    createdAt: string;
    updatedAt: string;
    owner: User;
    permissions: DocumentPermission[];
}

export interface DocumentPermission {
    id: string;
    permission: "owner" | "editor" | "commenter" | "viewer";
    invitedBy?: string;
    invitedAt?: string;
    createdAt: string;
    updatedAt: string;
    user: User;
}

export interface CreateDocumentRequest {
    title: string;
    content?: string;
    metadata?: any;
    isPublic?: boolean;
    isTemplate?: boolean;
    templateCategory?: string;
}

export interface UpdateDocumentRequest {
    title?: string;
    content?: string;
    metadata?: any;
    isPublic?: boolean;
    isTemplate?: boolean;
    templateCategory?: string;
}

export interface ShareDocumentRequest {
    email: string;
    permission: "editor" | "commenter" | "viewer";
}
