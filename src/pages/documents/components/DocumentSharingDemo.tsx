import React, { useState } from "react";
import { Button } from "@/components/ui";
import DocumentShareModal from "./DocumentShareModal";
import DocumentVisibilitySettings from "./DocumentVisibilitySettings";
import { DocumentCard } from "./DocumentCard";
import { DocumentList } from "./DocumentList";

// 데모용 샘플 데이터
const sampleDocument = {
  id: "doc-1",
  title: "프로젝트 기획서",
  content: `# 실시간 협업 도구 프로젝트

## 프로젝트 개요
이 프로젝트는 Google Docs와 같은 실시간 협업 문서 편집 도구를 개발하는 것입니다.

## 주요 기능
1. 실시간 문서 편집
2. 사용자 권한 관리
3. 댓글 및 제안 기능
4. 버전 히스토리

## 기술 스택
- Backend: Node.js + NestJS
- Database: PostgreSQL
- Cache: Redis
- Frontend: React (진행 중)`,
  metadata: {
    tags: ["프로젝트", "기획", "협업"],
    theme: "light",
    fontSize: 14,
  },
  version: 3,
  isPublic: true,
  isTemplate: false,
  templateCategory: undefined,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T14:30:00Z",
  owner: {
    id: "user-1",
    email: "admin@example.com",
    username: "admin",
    role: "admin" as const,
    avatarUrl: undefined,
    isActive: true,
    lastLoginAt: "2024-01-20T14:30:00Z",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  permissions: [
    {
      id: "perm-1",
      permission: "owner" as const,
      invitedBy: undefined,
      invitedAt: undefined,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      user: {
        id: "user-1",
        email: "admin@example.com",
        username: "admin",
        role: "admin" as const,
        avatarUrl: undefined,
        isActive: true,
        lastLoginAt: "2024-01-20T14:30:00Z",
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-20T14:30:00Z",
      },
    },
    {
      id: "perm-2",
      permission: "editor" as const,
      invitedBy: "user-1",
      invitedAt: "2024-01-16T09:00:00Z",
      createdAt: "2024-01-16T09:00:00Z",
      updatedAt: "2024-01-16T09:00:00Z",
      user: {
        id: "user-2",
        email: "editor@example.com",
        username: "editor_user",
        role: "user" as const,
        avatarUrl: undefined,
        isActive: true,
        lastLoginAt: "2024-01-19T11:20:00Z",
        createdAt: "2024-01-10T09:00:00Z",
        updatedAt: "2024-01-19T11:20:00Z",
      },
    },
    {
      id: "perm-3",
      permission: "viewer" as const,
      invitedBy: "user-1",
      invitedAt: "2024-01-18T11:00:00Z",
      createdAt: "2024-01-18T11:00:00Z",
      updatedAt: "2024-01-18T11:00:00Z",
      user: {
        id: "user-3",
        email: "viewer@example.com",
        username: "viewer_user",
        role: "user" as const,
        avatarUrl: undefined,
        isActive: true,
        lastLoginAt: "2024-01-18T16:30:00Z",
        createdAt: "2024-01-12T11:00:00Z",
        updatedAt: "2024-01-18T16:30:00Z",
      },
    },
  ],
};

const sampleDocuments = [
  sampleDocument,
  {
    ...sampleDocument,
    id: "doc-2",
    title: "회의록 템플릿",
    isPublic: false,
    isTemplate: true,
    templateCategory: "회의록", // 문자열 값
    permissions: [sampleDocument.permissions[0]], // 소유자만
  },
  {
    ...sampleDocument,
    id: "doc-3",
    title: "개인 메모",
    isPublic: false,
    isTemplate: false,
    templateCategory: undefined, // undefined 사용
    content: "개인적인 메모 내용...",
    metadata: {
      tags: ["개인", "메모"],
    },
    permissions: [sampleDocument.permissions[0]], // 소유자만
  },
];

const DocumentSharingDemo: React.FC = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(sampleDocument);

  const handleShare = (document: any) => {
    setSelectedDocument(document);
    setShowShareModal(true);
  };

  const handleVisibilitySettings = (document: any) => {
    setSelectedDocument(document);
    setShowVisibilityModal(true);
  };

  const handleDuplicate = (document: any) => {
    alert(`"${document.title}" 문서를 복제합니다.`);
  };

  const handleDelete = (document: any) => {
    if (confirm(`"${document.title}" 문서를 삭제하시겠습니까?`)) {
      alert("문서가 삭제되었습니다.");
    }
  };

  const handleNavigate = (documentId: string) => {
    alert(`문서 ${documentId}로 이동합니다.`);
  };

  const handleDocumentUpdate = (updatedDocument: any) => {
    console.log("문서가 업데이트되었습니다:", updatedDocument);
    // 실제 앱에서는 여기서 문서 목록을 새로고침하거나 상태를 업데이트합니다.
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📄 문서 공유 시스템 데모
          </h1>
          <p className="text-gray-600">
            실시간 협업 도구의 문서 공유 및 권한 관리 기능을 체험해보세요
          </p>
        </div>

        {/* 빠른 액션 버튼들 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚀 빠른 테스트
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleShare(sampleDocument)}
              leftIcon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              }
            >
              문서 공유하기
            </Button>

            <Button
              variant="outline"
              onClick={() => handleVisibilitySettings(sampleDocument)}
              leftIcon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
            >
              공개 설정
            </Button>
          </div>
        </div>

        {/* 샘플 문서 카드 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 문서 카드 미리보기
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onShare={handleShare}
                onVisibilitySettings={handleVisibilitySettings}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onNavigate={handleNavigate}
                showActions={true}
              />
            ))}
          </div>
        </div>

        {/* 기능 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🔗 문서 공유 기능
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 이메일로 사용자 초대</li>
              <li>• 권한 레벨 설정 (소유자/편집자/댓글 작성자/뷰어)</li>
              <li>• 공개 링크 생성 및 관리</li>
              <li>• 실시간 권한 변경</li>
              <li>• 사용자 접근 권한 제거</li>
              <li>• 이메일로 링크 공유</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              ⚙️ 공개 설정 기능
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 공개/비공개 문서 설정</li>
              <li>• 템플릿으로 설정</li>
              <li>• 템플릿 카테고리 관리</li>
              <li>• 검색 엔진 노출 제어</li>
              <li>• 링크 접근 권한 관리</li>
              <li>• 설정 변경 사항 미리보기</li>
            </ul>
          </div>
        </div>

        {/* 권한 시스템 설명 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            👥 권한 시스템
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">O</span>
              </div>
              <h4 className="font-medium text-green-700">소유자</h4>
              <p className="text-sm text-green-600 mt-1">모든 권한</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">E</span>
              </div>
              <h4 className="font-medium text-blue-700">편집자</h4>
              <p className="text-sm text-blue-600 mt-1">편집 및 댓글</p>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">C</span>
              </div>
              <h4 className="font-medium text-yellow-700">댓글 작성자</h4>
              <p className="text-sm text-yellow-600 mt-1">댓글만 가능</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">V</span>
              </div>
              <h4 className="font-medium text-gray-700">뷰어</h4>
              <p className="text-sm text-gray-600 mt-1">읽기 전용</p>
            </div>
          </div>
        </div>

        {/* 기술 스택 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🛠️ 기술 스택
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Frontend</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• React 19</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• React Query</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Backend</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• NestJS</li>
                <li>• PostgreSQL</li>
                <li>• Redis</li>
                <li>• Socket.io</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">인증</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• JWT</li>
                <li>• Passport.js</li>
                <li>• bcrypt</li>
                <li>• Guards</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">실시간</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• WebSocket</li>
                <li>• Redis Pub/Sub</li>
                <li>• OT Algorithm</li>
                <li>• Live Cursors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 개발 진행 상황 */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📈 개발 진행 상황
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">✅ 백엔드 API</span>
              <span className="text-blue-600 font-medium">100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">✅ 인증 시스템</span>
              <span className="text-blue-600 font-medium">100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">✅ 기본 UI 컴포넌트</span>
              <span className="text-blue-600 font-medium">100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">🔄 문서 공유 시스템</span>
              <span className="text-blue-600 font-medium">90%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">📋 문서 관리</span>
              <span className="text-blue-600 font-medium">85%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">⏳ 실시간 에디터</span>
              <span className="text-gray-600 font-medium">70%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">⏳ 실시간 협업</span>
              <span className="text-gray-600 font-medium">60%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <DocumentShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        document={selectedDocument}
      />

      <DocumentVisibilitySettings
        isOpen={showVisibilityModal}
        onClose={() => setShowVisibilityModal(false)}
        document={selectedDocument}
        onUpdate={handleDocumentUpdate}
      />
    </div>
  );
};

export default DocumentSharingDemo;
