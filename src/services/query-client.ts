import { QueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/types/api.types";

// React Query 클라이언트 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const apiError = error as unknown as ApiError;

        // 401, 403, 404 에러는 재시도하지 않음
        if (
          apiError.statusCode &&
          [401, 403, 404].includes(apiError.statusCode)
        ) {
          return false;
        }

        // 최대 3번 재시도
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (구 cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// Query Key 팩토리
export const queryKeys = {
  // 인증 관련
  auth: {
    profile: () => ["auth", "profile"] as const,
    refresh: () => ["auth", "refresh"] as const,
  },

  // 문서 관련
  documents: {
    all: () => ["documents"] as const,
    lists: () => [...queryKeys.documents.all(), "list"] as const,
    list: (filters: string) =>
      [...queryKeys.documents.lists(), { filters }] as const,
    details: () => [...queryKeys.documents.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.documents.details(), id] as const,
    permissions: (documentId: string) =>
      [...queryKeys.documents.detail(documentId), "permissions"] as const,
  },

  // 사용자 관련
  users: {
    all: () => ["users"] as const,
    lists: () => [...queryKeys.users.all(), "list"] as const,
    list: (filters: string) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
} as const;

export default queryClient;
