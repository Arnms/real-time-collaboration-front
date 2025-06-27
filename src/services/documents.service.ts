import { api } from "./api";
import type {
  Document,
  DocumentPermission,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  ShareDocumentRequest,
} from "@/types/document.types";
import type { PaginationResponse, PaginationQuery } from "@/types/api.types";

export class DocumentsService {
  // 내 문서 목록 조회
  static async getMyDocuments(
    params?: PaginationQuery & {
      isPublic?: boolean;
      isTemplate?: boolean;
      templateCategory?: string;
      tags?: string;
    }
  ): Promise<PaginationResponse<Document>> {
    return api.get<PaginationResponse<Document>>("/documents/my", params);
  }

  // 공유받은 문서 목록 조회
  static async getSharedDocuments(
    params?: PaginationQuery
  ): Promise<PaginationResponse<Document>> {
    return api.get<PaginationResponse<Document>>("/documents/shared", params);
  }

  // 공개 문서 목록 조회
  static async getPublicDocuments(
    params?: PaginationQuery & {
      isTemplate?: boolean;
      templateCategory?: string;
      tags?: string;
    }
  ): Promise<PaginationResponse<Document>> {
    return api.get<PaginationResponse<Document>>("/documents/public", params);
  }

  // 문서 상세 조회
  static async getDocument(id: string): Promise<Document> {
    return api.get<Document>(`/documents/${id}`);
  }

  // 공개 문서 상세 조회 (로그인 불필요)
  static async getPublicDocument(id: string): Promise<Document> {
    return api.get<Document>(`/documents/public/${id}`);
  }

  // 문서 생성
  static async createDocument(data: CreateDocumentRequest): Promise<Document> {
    return api.post<Document>("/documents", data);
  }

  // 문서 수정
  static async updateDocument(
    id: string,
    data: UpdateDocumentRequest
  ): Promise<Document> {
    return api.patch<Document>(`/documents/${id}`, data);
  }

  // 문서 삭제
  static async deleteDocument(id: string): Promise<void> {
    return api.delete(`/documents/${id}`);
  }

  // 문서 공유
  static async shareDocument(
    id: string,
    data: ShareDocumentRequest
  ): Promise<DocumentPermission> {
    return api.post<DocumentPermission>(`/documents/${id}/share`, data);
  }

  // 문서 대량 공유
  static async bulkShareDocument(
    id: string,
    data: { users: ShareDocumentRequest[] }
  ): Promise<DocumentPermission[]> {
    return api.post<DocumentPermission[]>(`/documents/${id}/share/bulk`, data);
  }

  // 문서 권한 목록 조회
  static async getDocumentPermissions(
    id: string
  ): Promise<DocumentPermission[]> {
    return api.get<DocumentPermission[]>(`/documents/${id}/permissions`);
  }

  // 문서 권한 수정
  static async updateDocumentPermission(
    documentId: string,
    userId: string,
    permission: "editor" | "commenter" | "viewer"
  ): Promise<DocumentPermission> {
    return api.patch<DocumentPermission>(
      `/documents/${documentId}/permissions/${userId}`,
      { permission }
    );
  }

  // 문서 권한 제거
  static async removeDocumentPermission(
    documentId: string,
    userId: string
  ): Promise<void> {
    return api.delete(`/documents/${documentId}/permissions/${userId}`);
  }

  // 내 문서 권한 조회
  static async getMyDocumentPermission(
    id: string
  ): Promise<{ permission: string | null }> {
    return api.get<{ permission: string | null }>(
      `/documents/${id}/my-permission`
    );
  }

  // 문서 검색
  static async searchDocuments(
    query: string,
    params?: PaginationQuery
  ): Promise<PaginationResponse<Document>> {
    return api.get<PaginationResponse<Document>>("/documents/my", {
      ...params,
      search: query,
    });
  }

  // 템플릿 목록 조회
  static async getTemplates(
    params?: PaginationQuery & {
      templateCategory?: string;
      tags?: string;
    }
  ): Promise<PaginationResponse<Document>> {
    return api.get<PaginationResponse<Document>>("/documents/public", {
      ...params,
      isTemplate: true,
    });
  }

  // 템플릿으로부터 문서 생성
  static async createFromTemplate(
    templateId: string,
    title: string
  ): Promise<Document> {
    const template = await this.getDocument(templateId);

    return this.createDocument({
      title,
      content: template.content,
      metadata: {
        ...template.metadata,
        originalTemplate: templateId,
      },
      isTemplate: false,
    });
  }

  // 문서 복제
  static async duplicateDocument(
    documentId: string,
    title: string
  ): Promise<Document> {
    const originalDocument = await this.getDocument(documentId);

    return this.createDocument({
      title,
      content: originalDocument.content,
      metadata: {
        ...originalDocument.metadata,
        originalDocument: documentId,
      },
      isPublic: false, // 복제된 문서는 기본적으로 비공개
      isTemplate: false, // 복제된 문서는 일반 문서로
    });
  }
}

export default DocumentsService;
