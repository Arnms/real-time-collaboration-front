import { api } from "./api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth.types";

export class AuthService {
  // 로그인
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);

    // 토큰을 localStorage에 저장
    if (response.accessToken) {
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  }

  // 회원가입
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", userData);

    // 회원가입 성공 시 자동 로그인 처리
    if (response.accessToken) {
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  }

  // 로그아웃
  static async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // 로그아웃 API 실패해도 로컬 토큰은 제거
      console.warn("Logout API failed:", error);
    } finally {
      // 로컬 스토리지에서 토큰 및 사용자 정보 제거
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  }

  // 프로필 조회
  static async getProfile(): Promise<User> {
    return api.get<User>("/auth/profile");
  }

  // 토큰 갱신
  static async refreshToken(): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    const response = await api.post<{ accessToken: string; expiresIn: number }>(
      "/auth/refresh"
    );

    // 새 토큰 저장
    if (response.accessToken) {
      localStorage.setItem("accessToken", response.accessToken);
    }

    return response;
  }

  // 로컬 스토리지에서 사용자 정보 가져오기
  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  }

  // 로컬 스토리지에서 토큰 가져오기
  static getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  // 로그인 상태 확인
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // 사용자 역할 확인
  static hasRole(requiredRole: "admin" | "user" | "guest"): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roleHierarchy = {
      admin: 3,
      user: 2,
      guest: 1,
    };

    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[requiredRole];

    return userLevel >= requiredLevel;
  }
}

export default AuthService;
