import React from "react";
import { Link } from "react-router-dom";
import {
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Button, Avatar } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/providers/ToastProvider";

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const toast = useToastContext();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("로그아웃", "성공적으로 로그아웃되었습니다.");
    } catch (error) {
      toast.error("로그아웃 실패", "오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                실시간 협업 도구
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar
                  name={user?.username || ""}
                  size="sm"
                  showOnlineIndicator
                  isOnline
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            안녕하세요, {user?.username}님! 👋
          </h2>
          <p className="text-gray-600">
            실시간 협업 도구에 오신 것을 환영합니다. 팀과 함께 문서를 작성하고
            편집해보세요.
          </p>
        </div>

        {/* 퀵 액션 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                새 문서 만들기
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              새로운 문서를 생성하고 팀과 실시간으로 협업하세요.
            </p>
            <Button className="w-full" disabled>
              문서 생성 (준비 중)
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                공유받은 문서
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              다른 사용자가 공유한 문서들을 확인하고 편집하세요.
            </p>
            <Button variant="outline" className="w-full" disabled>
              문서 보기 (준비 중)
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                최근 활동
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              최근에 편집한 문서들과 활동 내역을 확인하세요.
            </p>
            <Button variant="outline" className="w-full" disabled>
              활동 보기 (준비 중)
            </Button>
          </div>
        </div>

        {/* 상태 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">내 문서</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  공유받은 문서
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">협업자</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">편집 횟수</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <ClockIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* 시작하기 가이드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🚀 시작하기 가이드
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  첫 번째 문서 만들기
                </h4>
                <p className="text-sm text-gray-600">
                  "새 문서 만들기" 버튼을 클릭하여 첫 번째 문서를 생성해보세요.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">팀원 초대하기</h4>
                <p className="text-sm text-gray-600">
                  문서를 생성한 후 이메일을 통해 팀원들을 초대하고 권한을
                  설정하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  실시간 편집 경험하기
                </h4>
                <p className="text-sm text-gray-600">
                  여러 사용자가 동시에 편집하며 실시간 협업의 재미를 느껴보세요.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">백엔드 API 테스트</h4>
                <p className="text-sm text-gray-600">
                  현재 백엔드 연결이 성공적으로 이루어졌습니다!
                </p>
              </div>
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm font-medium">연결됨</span>
              </div>
            </div>
          </div>
        </div>

        {/* 현재 개발 상태 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">ℹ</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-2">개발 진행 상황</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  ✅ <strong>완료:</strong> 인증 시스템, API 연결, 기본 UI
                </p>
                <p>
                  🔄 <strong>진행 중:</strong> 문서 관리 페이지
                </p>
                <p>
                  📋 <strong>예정:</strong> 실시간 에디터, 협업 기능
                </p>
              </div>
              <div className="mt-3">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "40%" }}
                  ></div>
                </div>
                <p className="text-xs text-blue-700 mt-1">전체 진행률: 40%</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
