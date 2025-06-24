import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/providers/ToastProvider";
import type { LoginRequest } from "@/types/auth.types";
import type { ApiError } from "@/types/api.types";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuth();
  const toast = useToastContext();

  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 입력 변경 핸들러
  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 실시간 에러 클리어
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // 로그인 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      toast.success("로그인 성공", "환영합니다!");
      navigate("/dashboard");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("로그인 실패", apiError.message);

      // 특정 에러에 따른 필드 에러 설정
      if (apiError.message.includes("이메일")) {
        setErrors({ email: apiError.message });
      } else if (apiError.message.includes("비밀번호")) {
        setErrors({ password: apiError.message });
      }
    }
  };

  // 데모 계정 로그인
  const handleDemoLogin = async () => {
    try {
      await login({
        email: "admin@example.com",
        password: "admin123!@#",
      });
      toast.success("데모 계정 로그인", "관리자 계정으로 로그인되었습니다.");
      navigate("/dashboard");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("데모 로그인 실패", apiError.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            실시간 협업 도구
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            계정에 로그인하여 협업을 시작하세요
          </p>
        </div>

        {/* 로그인 폼 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="이메일"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="admin@example.com"
              leftIcon={<EnvelopeIcon className="w-5 h-5" />}
              error={errors.email}
              required
              disabled={isLoggingIn}
            />

            <Input
              label="비밀번호"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              required
              disabled={isLoggingIn}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              }
            />
          </div>

          {/* 버튼들 */}
          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              loading={isLoggingIn}
              disabled={isLoggingIn}
            >
              로그인
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={isLoggingIn}
            >
              데모 계정으로 체험하기
            </Button>
          </div>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                회원가입
              </Link>
            </p>
          </div>
        </form>

        {/* 도움말 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            데모 계정 정보
          </h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p>
              <strong>관리자:</strong> admin@example.com / admin123!@#
            </p>
            <p>
              <strong>일반 사용자:</strong> user@example.com / user123!@#
            </p>
            <p>
              <strong>게스트:</strong> guest@example.com / guest123!@#
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
