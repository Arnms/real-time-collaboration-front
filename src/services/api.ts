import axios, { AxiosError, AxiosResponse } from "axios";
import type { ApiResponse, ApiError } from "@/types/api.types";

// API 기본 설정
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // 401 에러 (인증 만료) 처리
    if (error.response?.status === 401 && originalRequest) {
      // 토큰 제거 및 로그인 페이지로 리다이렉트
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      // 로그인 페이지로 리다이렉트 (React Router 사용 시)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // 에러 형태를 일관성 있게 변환
    const apiError: ApiError = {
      success: false,
      error: error.response?.data?.error || "Network Error",
      message:
        error.response?.data?.message ||
        error.message ||
        "알 수 없는 오류가 발생했습니다.",
      statusCode: error.response?.status || 500,
      details: error.response?.data?.details,
    };

    return Promise.reject(apiError);
  }
);

// 공통 API 호출 함수들
export const api = {
  get: <T = any>(url: string, params?: any): Promise<T> =>
    apiClient.get(url, { params }).then((res) => res.data),

  post: <T = any>(url: string, data?: any): Promise<T> =>
    apiClient.post(url, data).then((res) => res.data),

  put: <T = any>(url: string, data?: any): Promise<T> =>
    apiClient.put(url, data).then((res) => res.data),

  patch: <T = any>(url: string, data?: any): Promise<T> =>
    apiClient.patch(url, data).then((res) => res.data),

  delete: <T = any>(url: string): Promise<T> =>
    apiClient.delete(url).then((res) => res.data),
};

// 타입 안전한 API 응답 처리
export const handleApiResponse = <T>(response: ApiResponse<T> | T): T => {
  // 백엔드에서 ApiResponse 형태로 온 경우
  if (response && typeof response === "object" && "success" in response) {
    const apiResponse = response as ApiResponse<T>;
    if (apiResponse.success) {
      return apiResponse.data;
    }
    throw new Error(apiResponse.message || "API 요청이 실패했습니다.");
  }

  // 직접 데이터가 온 경우
  return response as T;
};

export default api;
