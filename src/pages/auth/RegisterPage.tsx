import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EnvelopeIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/providers/ToastProvider";
import type { RegisterRequest } from "@/types/auth.types";
import type { ApiError } from "@/types/api.types";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isRegistering } = useAuth();
  const toast = useToastContext();

  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    username: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<RegisterRequest & { confirmPassword: string }>
  >({});

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterRequest & { confirmPassword: string }> =
      {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    // 사용자명 검증
    if (!formData.username) {
      newErrors.username = "사용자명을 입력해주세요.";
    } else if (formData.username.length < 3) {
      newErrors.username = "사용자명은 최소 3자 이상이어야 합니다.";
    } else if (formData.username.length > 20) {
      newErrors.username = "사용자명은 최대 20자까지 가능합니다.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.";
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    } else if (
      !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        formData.password
      )
    ) {
      newErrors.password = "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.";
    }

    // 비밀번호 확인 검증
    if (!confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 입력 변경 핸들러
  const handleInputChange = (field: keyof RegisterRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 실시간 에러 클리어
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // 비밀번호 확인 변경 핸들러
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);

    // 실시간 에러 클리어
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  // 회원가입 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      toast.success("회원가입 성공", "환영합니다! 자동으로 로그인되었습니다.");
      navigate("/dashboard");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("회원가입 실패", apiError.message);

      // 특정 에러에 따른 필드 에러 설정
      if (apiError.message.includes("이메일")) {
        setErrors({ email: apiError.message });
      } else if (apiError.message.includes("사용자명")) {
        setErrors({ username: apiError.message });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">계정 만들기</h2>
          <p className="mt-2 text-sm text-gray-600">
            새로운 계정을 만들어 협업을 시작하세요
          </p>
        </div>

        {/* 회원가입 폼 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="이메일"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your@email.com"
              leftIcon={<EnvelopeIcon className="w-5 h-5" />}
              error={errors.email}
              required
              disabled={isRegistering}
            />

            <Input
              label="사용자명"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="johndoe"
              leftIcon={<UserIcon className="w-5 h-5" />}
              error={errors.username}
              helperText="3-20자의 영문, 숫자, 언더스코어만 가능"
              required
              disabled={isRegistering}
            />

            <Input
              label="비밀번호"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              helperText="영문, 숫자, 특수문자 포함 8자 이상"
              required
              disabled={isRegistering}
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

            <Input
              label="비밀번호 확인"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              placeholder="••••••••"
              error={errors.confirmPassword}
              required
              disabled={isRegistering}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              }
            />
          </div>

          {/* 버튼 */}
          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              loading={isRegistering}
              disabled={isRegistering}
            >
              회원가입
            </Button>
          </div>

          {/* 로그인 링크 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                로그인
              </Link>
            </p>
          </div>
        </form>

        {/* 약관 정보 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            회원가입을 진행하면{" "}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              서비스 약관
            </a>{" "}
            및{" "}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              개인정보 처리방침
            </a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
