import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";
import { queryKeys } from "@/services/query-client";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth.types";
import type { ApiError } from "@/types/api.types";

// 인증 상태 훅
export const useAuth = () => {
  const queryClient = useQueryClient();

  // 현재 사용자 정보 조회
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: AuthService.getProfile,
    enabled: AuthService.isAuthenticated(),
    retry: false,
  });

  // 로그인 뮤테이션
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => AuthService.login(credentials),
    onSuccess: (data) => {
      // 사용자 정보를 쿼리 캐시에 저장
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);

      // 다른 쿼리들 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error: ApiError) => {
      console.error("Login failed:", error);
    },
  });

  // 회원가입 뮤테이션
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) => AuthService.register(userData),
    onSuccess: (data) => {
      // 회원가입 성공 시 자동 로그인 처리
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);
    },
    onError: (error: ApiError) => {
      console.error("Registration failed:", error);
    },
  });

  // 로그아웃 뮤테이션
  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      // 모든 쿼리 캐시 클리어
      queryClient.clear();
    },
    onError: (error: ApiError) => {
      console.error("Logout failed:", error);
      // 에러가 있어도 캐시는 클리어
      queryClient.clear();
    },
  });

  // 토큰 갱신 뮤테이션
  const refreshTokenMutation = useMutation({
    mutationFn: AuthService.refreshToken,
    onError: (error: ApiError) => {
      console.error("Token refresh failed:", error);
      // 토큰 갱신 실패 시 로그아웃 처리
      AuthService.logout();
      queryClient.clear();
    },
  });

  return {
    // 사용자 정보
    user: user || AuthService.getCurrentUser(),
    isAuthenticated: AuthService.isAuthenticated(),
    isLoading: isLoadingUser,
    error: userError,

    // 액션들
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshToken: refreshTokenMutation.mutateAsync,

    // 상태들
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // 에러들
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,

    // 유틸리티
    hasRole: AuthService.hasRole,
  };
};

// 로그인 필수 훅
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    throw new Error("Authentication required");
  }

  return { isAuthenticated, isLoading };
};
