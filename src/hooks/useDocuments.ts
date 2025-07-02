import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DocumentsService } from "@/services/documents.service";
import { queryKeys } from "@/services/query-client";
import type {
  CreateDocumentRequest,
  UpdateDocumentRequest,
  ShareDocumentRequest,
} from "@/types/document.types";
import type { PaginationQuery, ApiError } from "@/types/api.types";

// 내 문서 목록 조회
export const useMyDocuments = (
  params?: PaginationQuery & {
    isPublic?: boolean;
    isTemplate?: boolean;
    templateCategory?: string;
    tags?: string;
  }
) => {
  return useQuery({
    queryKey: queryKeys.documents.list(`my-${JSON.stringify(params || {})}`),
    queryFn: () => DocumentsService.getMyDocuments(params),
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 공유받은 문서 목록 조회
export const useSharedDocuments = (params?: PaginationQuery) => {
  return useQuery({
    queryKey: queryKeys.documents.list(
      `shared-${JSON.stringify(params || {})}`
    ),
    queryFn: () => DocumentsService.getSharedDocuments(params),
    staleTime: 2 * 60 * 1000,
  });
};

// 공개 문서 목록 조회
export const usePublicDocuments = (
  params?: PaginationQuery & {
    isTemplate?: boolean;
    templateCategory?: string;
    tags?: string;
  }
) => {
  return useQuery({
    queryKey: queryKeys.documents.list(
      `public-${JSON.stringify(params || {})}`
    ),
    queryFn: () => DocumentsService.getPublicDocuments(params),
    staleTime: 5 * 60 * 1000, // 공개 문서는 더 오래 캐시
  });
};

// 문서 상세 조회
export const useDocument = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => DocumentsService.getDocument(id),
    enabled: enabled && !!id,
    staleTime: 30 * 1000, // 30초 (실시간 편집을 위해 짧게)
  });
};

// 문서 권한 목록 조회
export const useDocumentPermissions = (documentId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.documents.permissions(documentId),
    queryFn: () => DocumentsService.getDocumentPermissions(documentId),
    enabled: enabled && !!documentId,
    staleTime: 2 * 60 * 1000,
  });
};

// 내 문서 권한 조회
export const useMyDocumentPermission = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.documents.detail(id), "my-permission"],
    queryFn: () => DocumentsService.getMyDocumentPermission(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// 템플릿 목록 조회
export const useTemplates = (
  params?: PaginationQuery & {
    templateCategory?: string;
    tags?: string;
  }
) => {
  return useQuery({
    queryKey: queryKeys.documents.list(
      `templates-${JSON.stringify(params || {})}`
    ),
    queryFn: () => DocumentsService.getTemplates(params),
    staleTime: 10 * 60 * 1000, // 템플릿은 더 오래 캐시
  });
};

// 문서 생성
export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentRequest) =>
      DocumentsService.createDocument(data),
    onSuccess: () => {
      // 문서 목록들 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() });
    },
    onError: (error: ApiError) => {
      console.error("Document creation failed:", error);
    },
  });
};

// 문서 수정
export const useUpdateDocument = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDocumentRequest) =>
      DocumentsService.updateDocument(id, data),
    onSuccess: (updatedDocument) => {
      // 해당 문서 캐시 업데이트
      queryClient.setQueryData(queryKeys.documents.detail(id), updatedDocument);

      // 문서 목록들 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() });
    },
    onError: (error: ApiError) => {
      console.error("Document update failed:", error);
    },
  });
};

// 문서 삭제
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DocumentsService.deleteDocument(id),
    onSuccess: (_, deletedId) => {
      // 해당 문서 캐시 제거
      queryClient.removeQueries({
        queryKey: queryKeys.documents.detail(deletedId),
      });

      // 문서 목록들 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() });
    },
    onError: (error: ApiError) => {
      console.error("Document deletion failed:", error);
    },
  });
};

// 문서 공유
export const useShareDocument = (documentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ShareDocumentRequest) =>
      DocumentsService.shareDocument(documentId, data),
    onSuccess: () => {
      // 문서 권한 목록 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.permissions(documentId),
      });

      // 공유받은 문서 목록 무효화 (다른 사용자 관점에서)
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.list("shared"),
      });
    },
    onError: (error: ApiError) => {
      console.error("Document sharing failed:", error);
    },
  });
};

// 문서 대량 공유
export const useBulkShareDocument = (documentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { users: ShareDocumentRequest[] }) =>
      DocumentsService.bulkShareDocument(documentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.permissions(documentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.list("shared"),
      });
    },
    onError: (error: ApiError) => {
      console.error("Bulk document sharing failed:", error);
    },
  });
};

// 문서 권한 수정
export const useUpdateDocumentPermission = (documentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      permission,
    }: {
      userId: string;
      permission: "editor" | "commenter" | "viewer";
    }) =>
      DocumentsService.updateDocumentPermission(documentId, userId, permission),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.permissions(documentId),
      });
    },
    onError: (error: ApiError) => {
      console.error("Permission update failed:", error);
    },
  });
};

// 문서 권한 제거
export const useRemoveDocumentPermission = (documentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      DocumentsService.removeDocumentPermission(documentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.permissions(documentId),
      });
    },
    onError: (error: ApiError) => {
      console.error("Permission removal failed:", error);
    },
  });
};

// 템플릿으로부터 문서 생성
export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      title,
    }: {
      templateId: string;
      title: string;
    }) => DocumentsService.createFromTemplate(templateId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() });
    },
    onError: (error: ApiError) => {
      console.error("Template document creation failed:", error);
    },
  });
};

// 문서 복제
export const useDuplicateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      title,
    }: {
      documentId: string;
      title: string;
    }) => DocumentsService.duplicateDocument(documentId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() });
    },
    onError: (error: ApiError) => {
      console.error("Document duplication failed:", error);
    },
  });
};
