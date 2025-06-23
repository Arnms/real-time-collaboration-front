import React, { useState } from "react";
import {
  Button,
  Input,
  Modal,
  Avatar,
  Spinner,
  ToastContainer,
  type ToastData,
} from "./index";
import {
  UserIcon,
  EnvelopeIcon,
  PlusIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

const UITestPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (
    type: ToastData["type"],
    title: string,
    message?: string
  ) => {
    const newToast: ToastData = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            UI 컴포넌트 테스트
          </h1>
          <p className="text-gray-600">
            실시간 협업 도구의 기본 UI 컴포넌트들을 테스트해보세요
          </p>
        </div>

        {/* 버튼들 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">버튼 컴포넌트</h2>
          <div className="bg-white p-6 rounded-lg border space-y-4">
            {/* Variants */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Sizes</h3>
              <div className="flex items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* With Icons */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">With Icons</h3>
              <div className="flex flex-wrap gap-3">
                <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
                  Add Document
                </Button>
                <Button
                  variant="outline"
                  rightIcon={<HeartIcon className="w-4 h-4" />}
                >
                  Like
                </Button>
                <Button loading>Loading...</Button>
              </div>
            </div>
          </div>
        </section>

        {/* 입력 필드들 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">입력 컴포넌트</h2>
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="이메일"
                type="email"
                placeholder="your@email.com"
                leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                required
              />
              <Input
                label="사용자명"
                placeholder="johndoe"
                leftIcon={<UserIcon className="w-5 h-5" />}
                helperText="3-20자의 영문, 숫자, 언더스코어만 가능"
              />
              <Input
                label="에러 예시"
                error="올바른 이메일 형식이 아닙니다."
                placeholder="error@example.com"
              />
              <Input
                label="비활성화된 입력"
                disabled
                placeholder="비활성화됨"
              />
            </div>
          </div>
        </section>

        {/* 아바타들 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            아바타 컴포넌트
          </h2>
          <div className="bg-white p-6 rounded-lg border space-y-4">
            {/* Sizes */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Sizes</h3>
              <div className="flex items-center gap-4">
                <Avatar name="John Doe" size="xs" />
                <Avatar name="Jane Smith" size="sm" />
                <Avatar name="Bob Johnson" size="md" />
                <Avatar name="Alice Brown" size="lg" />
                <Avatar name="Charlie Wilson" size="xl" />
              </div>
            </div>

            {/* With Online Indicator */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Online Status
              </h3>
              <div className="flex items-center gap-4">
                <Avatar
                  name="Online User"
                  showOnlineIndicator
                  isOnline
                  size="lg"
                />
                <Avatar
                  name="Offline User"
                  showOnlineIndicator
                  isOnline={false}
                  size="lg"
                />
              </div>
            </div>

            {/* Different Names (Different Colors) */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Different Users
              </h3>
              <div className="flex items-center gap-3">
                <Avatar name="Admin User" size="md" />
                <Avatar name="Test User" size="md" />
                <Avatar name="Guest User" size="md" />
                <Avatar name="Demo User" size="md" />
                <Avatar name="Sample User" size="md" />
              </div>
            </div>
          </div>
        </section>

        {/* 스피너들 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">로딩 스피너</h2>
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Sizes</h3>
              <div className="flex items-center gap-4">
                <Spinner size="xs" />
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Colors</h3>
              <div className="flex items-center gap-4">
                <Spinner color="primary" />
                <Spinner color="gray" />
                <div className="bg-gray-800 p-2 rounded">
                  <Spinner color="white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 모달 & 토스트 테스트 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">모달 & 알림</h2>
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Modal</h3>
              <Button onClick={() => setModalOpen(true)}>모달 열기</Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Toast Notifications
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    addToast(
                      "success",
                      "성공!",
                      "작업이 성공적으로 완료되었습니다."
                    )
                  }
                >
                  Success Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    addToast("error", "에러 발생", "작업을 완료할 수 없습니다.")
                  }
                >
                  Error Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    addToast("warning", "주의", "이 작업은 되돌릴 수 없습니다.")
                  }
                >
                  Warning Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    addToast("info", "정보", "새로운 업데이트가 있습니다.")
                  }
                >
                  Info Toast
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 실제 사용 예시 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            실제 사용 예시
          </h2>
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                로그인 폼 미리보기
              </h3>
              <div className="max-w-md space-y-4">
                <Input
                  label="이메일"
                  type="email"
                  placeholder="admin@example.com"
                  leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                  required
                />
                <Input
                  label="비밀번호"
                  type="password"
                  placeholder="••••••••"
                  required
                />
                <div className="flex gap-3">
                  <Button className="flex-1">로그인</Button>
                  <Button variant="outline">회원가입</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 협업 도구 미리보기 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            협업 도구 미리보기
          </h2>
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  문서: 프로젝트 계획서
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">현재 편집 중:</span>
                  <div className="flex items-center gap-1">
                    <Avatar
                      name="Admin User"
                      size="xs"
                      showOnlineIndicator
                      isOnline
                    />
                    <Avatar
                      name="Test User"
                      size="xs"
                      showOnlineIndicator
                      isOnline
                    />
                    <Avatar name="Guest User" size="xs" showOnlineIndicator />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-600 italic">
                  여기에 실시간 텍스트 에디터가 들어갑니다...
                  <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                </p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>마지막 저장: 방금 전</span>
                <span>버전 1.0</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 모달 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="예시 모달"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setModalOpen(false)}>확인</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            이것은 모달 컴포넌트의 예시입니다. 여기에 폼이나 다른 콘텐츠를 넣을
            수 있습니다.
          </p>
          <Input label="예시 입력" placeholder="무언가를 입력해보세요" />
        </div>
      </Modal>

      {/* 토스트 컨테이너 */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default UITestPage;
