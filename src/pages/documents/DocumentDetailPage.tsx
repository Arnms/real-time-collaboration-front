import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Button, Modal, Input, Spinner } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/providers/ToastProvider";
import {
  useDocument,
  useUpdateDocument,
  useDeleteDocument,
  useDuplicateDocument,
  useMyDocumentPermission,
} from "@/hooks/useDocuments";
import { DocumentEditor } from "./components/DocumentEditor";
import { CollaborationStatus } from "./components/CollaborationStatus";
import type { Document } from "@/types/document.types";
import { cn } from "@/utils/cn";

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToastContext();

  // 상태 관리
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // 실시간 협업 상태 (임시 데이터)
  const [onlineUsers] = useState([
    {
      id: "user1",
      username: "Alice",
      color: "#FF6B6B",
      isTyping: false,
    },
    {
      id: "user2",
      username: "Bob",
      color: "#4ECDC4",
      isTyping: true,
    },
  ]);
  const [connectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("connected");
  const [lastSyncTime] = useState(new Date());

  // API 훅들
  const documentQuery = useDocument(id!, !!id);
  const permissionQuery = useMyDocumentPermission(id!, !!id);
  const updateDocumentMutation = useUpdateDocument(id!);
  const deleteDocumentMutation = useDeleteDocument();
  const duplicateDocumentMutation = useDuplicateDocument();

  const document = documentQuery.data;
  const permission = permissionQuery.data?.permission;
  const isLoading = documentQuery.isLoading;
  const error = documentQuery.error;

  // 권한 확인
  const canEdit = permission === "owner" || permission === "editor";
  const canDelete = permission === "owner";
  const canShare = permission === "owner";

  // 문서 데이터 동기화
  useEffect(() => {
    if (document) {
      setDocumentTitle(document.title);
      setDocumentContent(document.content);
    }
  }, [document]);

  // 문서 내용 변경 핸들러
  const handleContentChange = useCallback((newContent: string) => {
    setDocumentContent(newContent);
  }, []);

  // 제목 변경 핸들러
  const handleTitleChange = async () => {
    if (!document || !canEdit || documentTitle.trim() === document.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateDocumentMutation.mutateAsync({
        title: documentTitle.trim(),
      });
      setIsEditingTitle(false);
      toast.success("제목 변경", "문서 제목이 업데이트되었습니다.");
    } catch (error: any) {
      toast.error("제목 변경 실패", error.message);
      setDocumentTitle(document.title); // 원래 제목으로 복원
      setIsEditingTitle(false);
    }
  };

  // 문서 저장
  const handleSave = async () => {
    if (!document || !canEdit) return;

    try {
      await updateDocumentMutation.mutateAsync({
        content: documentContent,
      });
    } catch (error: any) {
      toast.error("저장 실패", error.message);
      throw error; // 에디터에서 에러 처리할 수 있도록
    }
  };

  // 문서 복제
  const handleDuplicate = async () => {
    if (!document) return;

    try {
      const duplicatedDocument = await duplicateDocumentMutation.mutateAsync({
        documentId: document.id,
        title: `${document.title} - 복사본`,
      });

      toast.success("문서 복제", "문서가 성공적으로 복제되었습니다.");

      const shouldNavigate = window.confirm("복제된 문서로 이동하시겠습니까?");
      if (shouldNavigate) {
        navigate(`/documents/${duplicatedDocument.id}`);
      }
    } catch (error: any) {
      toast.error("복제 실패", error.message);
    }
  };

  // 문서 삭제
  const handleDelete = async () => {
    if (!document) return;

    try {
      await deleteDocumentMutation.mutateAsync(document.id);
      toast.success("문서 삭제", "문서가 삭제되었습니다.");
      navigate("/documents");
    } catch (error: any) {
      toast.error("삭제 실패", error.message);
    }
  };

  // 키보드 이벤트 처리
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleChange();
    } else if (e.key === "Escape") {
      setDocumentTitle(document?.title || "");
      setIsEditingTitle(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-500">문서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            문서를 불러올 수 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            {error?.message || "문서가 존재하지 않거나 접근 권한이 없습니다."}
          </p>
          <Button onClick={() => navigate("/documents")}>
            문서 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 왼쪽: 네비게이션 및 제목 */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <Link
                to="/documents"
                className="flex items-center text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                문서 목록
              </Link>

              <div className="h-6 border-l border-gray-300 flex-shrink-0" />

              {/* 문서 제목 */}
              <div className="min-w-0 flex-1">
                {isEditingTitle && canEdit ? (
                  <Input
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    onBlur={handleTitleChange}
                    onKeyDown={handleTitleKeyDown}
                    className="text-xl font-semibold border-0 px-0 focus:ring-0"
                    autoFocus
                    maxLength={200}
                  />
                ) : (
                  <h1
                    className={cn(
                      "text-xl font-semibold text-gray-900 truncate",
                      canEdit && "cursor-pointer hover:text-gray-700"
                    )}
                    onClick={() => canEdit && setIsEditingTitle(true)}
                    title={canEdit ? "클릭하여 제목 편집" : document.title}
                  >
                    {document.title}
                  </h1>
                )}
              </div>
            </div>

            {/* 오른쪽: 액션 버튼들 */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* 문서 정보 */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500 mr-4">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    {new Date(document.updatedAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <span>버전 {document.version}</span>
                <span className="capitalize">{permission}</span>
              </div>

              {/* 액션 버튼들 */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                leftIcon={<DocumentDuplicateIcon className="w-4 h-4" />}
                disabled={duplicateDocumentMutation.isPending}
              >
                복제
              </Button>

              {canShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  leftIcon={<ShareIcon className="w-4 h-4" />}
                >
                  공유
                </Button>
              )}

              {/* 더보기 메뉴 */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                </Button>
                {/* TODO: 드롭다운 메뉴 구현 */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 에디터 */}
      <div className="flex-1 flex flex-col">
        <DocumentEditor
          content={documentContent}
          onChange={handleContentChange}
          onSave={handleSave}
          readOnly={!canEdit}
          placeholder="문서 내용을 입력하세요..."
          autoSave={true}
          autoSaveInterval={3000}
          className="flex-1"
        />
      </div>

      {/* 하단 협업 상태 */}
      <CollaborationStatus
        onlineUsers={onlineUsers}
        connectionStatus={connectionStatus}
        documentVersion={document.version}
        lastSyncTime={lastSyncTime}
      />

      {/* 공유 모달 */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="문서 공유"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                toast.info("준비 중", "문서 공유 기능은 곧 구현될 예정입니다.");
                setShowShareModal(false);
              }}
            >
              공유하기
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            "{document.title}" 문서를 다른 사용자와 공유하세요.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 문서 공유 기능은 곧 구현될 예정입니다.
            </p>
          </div>
        </div>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="문서 삭제"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteDocumentMutation.isPending}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteDocumentMutation.isPending}
              disabled={deleteDocumentMutation.isPending}
            >
              삭제
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            "{document.title}" 문서를 정말 삭제하시겠습니까?
          </p>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">
              ⚠️ 이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentDetailPage;
