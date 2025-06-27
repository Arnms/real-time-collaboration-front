import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PlusIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Button, Modal } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/providers/ToastProvider";
import {
  useMyDocuments,
  useSharedDocuments,
  usePublicDocuments,
  useDeleteDocument,
  useDuplicateDocument,
} from "@/hooks/useDocuments";
import { DocumentList } from "./components/DocumentList";
import {
  DocumentFilters,
  type DocumentFilters as DocumentFiltersType,
} from "./components/DocumentFilters";
import { CreateDocumentModal } from "./components/CreateDocumentModal";
import { CreateFromTemplateModal } from "./components/CreateFromTemplateModal";
import type { Document } from "@/types/document.types";
import { cn } from "@/utils/cn";

type TabType = "my" | "shared" | "public" | "templates";

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToastContext();
  const navigate = useNavigate();

  // 상태 관리
  const [activeTab, setActiveTab] = useState<TabType>("my");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateFromTemplateModal, setShowCreateFromTemplateModal] =
    useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Mutation 훅들
  const deleteDocumentMutation = useDeleteDocument();
  const duplicateDocumentMutation = useDuplicateDocument();

  // 필터 상태
  const [filters, setFilters] = useState<DocumentFilters>({
    search: "",
    sortBy: "updatedAt",
    sortOrder: "DESC",
    tags: [],
  });

  // 쿼리 매개변수 생성
  const getQueryParams = () => ({
    page: 1,
    limit: 20,
    search: filters.search || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    tags: filters.tags.length > 0 ? filters.tags.join(",") : undefined,
    isTemplate: filters.isTemplate,
    templateCategory: filters.templateCategory,
  });

  // 데이터 조회 훅들
  const myDocumentsQuery = useMyDocuments(
    activeTab === "my" ? getQueryParams() : undefined
  );

  const sharedDocumentsQuery = useSharedDocuments(
    activeTab === "shared" ? { page: 1, limit: 20 } : undefined
  );

  const publicDocumentsQuery = usePublicDocuments(
    activeTab === "public" ? getQueryParams() : undefined
  );

  const templatesQuery = usePublicDocuments(
    activeTab === "templates"
      ? { ...getQueryParams(), isTemplate: true }
      : undefined
  );

  // 현재 활성 탭의 데이터 가져오기
  const getCurrentData = () => {
    switch (activeTab) {
      case "my":
        return myDocumentsQuery;
      case "shared":
        return sharedDocumentsQuery;
      case "public":
        return publicDocumentsQuery;
      case "templates":
        return templatesQuery;
      default:
        return myDocumentsQuery;
    }
  };

  const currentQuery = getCurrentData();
  const documents = currentQuery.data?.items || [];
  const isLoading = currentQuery.isLoading;
  const error = currentQuery.error?.message || null;

  // 필터 변경 시 데이터 새로고침
  useEffect(() => {
    currentQuery.refetch();
  }, [filters]);

  // 탭 정보
  const tabs = [
    {
      id: "my" as TabType,
      label: "내 문서",
      count: myDocumentsQuery.data?.total || 0,
    },
    {
      id: "shared" as TabType,
      label: "공유받은 문서",
      count: sharedDocumentsQuery.data?.total || 0,
    },
    {
      id: "public" as TabType,
      label: "공개 문서",
      count: publicDocumentsQuery.data?.total || 0,
    },
    {
      id: "templates" as TabType,
      label: "템플릿",
      count: templatesQuery.data?.total || 0,
    },
  ];

  // 이벤트 핸들러들
  const handleCreateDocument = () => {
    setShowCreateModal(true);
  };

  const handleCreateFromTemplate = () => {
    setShowCreateFromTemplateModal(true);
  };

  const handleDocumentCreated = (documentId: string) => {
    // 생성된 문서로 이동
    navigate(`/documents/${documentId}`);
  };

  const handleShare = (document: Document) => {
    setSelectedDocument(document);
    setShowShareModal(true);
  };

  const handleDelete = (document: Document) => {
    setSelectedDocument(document);
    setShowDeleteModal(true);
  };

  const handleDuplicate = async (document: Document) => {
    try {
      const duplicatedDocument = await duplicateDocumentMutation.mutateAsync({
        documentId: document.id,
        title: `${document.title} - 복사본`,
      });

      toast.success("문서 복제 완료", "문서가 성공적으로 복제되었습니다.");

      // 복제된 문서로 이동할지 물어보기
      const shouldNavigate = window.confirm("복제된 문서로 이동하시겠습니까?");
      if (shouldNavigate) {
        navigate(`/documents/${duplicatedDocument.id}`);
      }
    } catch (error: any) {
      toast.error(
        "문서 복제 실패",
        error.message || "문서 복제 중 오류가 발생했습니다."
      );
    }
  };

  const confirmDelete = async () => {
    if (!selectedDocument) return;

    try {
      await deleteDocumentMutation.mutateAsync(selectedDocument.id);
      toast.success("삭제 완료", "문서가 성공적으로 삭제되었습니다.");
      setShowDeleteModal(false);
      setSelectedDocument(null);
      currentQuery.refetch();
    } catch (error: any) {
      toast.error(
        "삭제 실패",
        error.message || "문서 삭제 중 오류가 발생했습니다."
      );
    }
  };

  // 헬퍼 함수들
  const getEmptyMessage = (): string => {
    switch (activeTab) {
      case "my":
        return "문서가 없습니다";
      case "shared":
        return "공유받은 문서가 없습니다";
      case "public":
        return "공개 문서가 없습니다";
      case "templates":
        return "템플릿이 없습니다";
      default:
        return "문서가 없습니다";
    }
  };

  const getEmptyDescription = (): string => {
    switch (activeTab) {
      case "my":
        return "새로운 문서를 만들어보세요.";
      case "shared":
        return "다른 사용자가 문서를 공유하면 여기에 표시됩니다.";
      case "public":
        return "공개된 문서들을 찾을 수 없습니다.";
      case "templates":
        return "사용 가능한 템플릿이 없습니다.";
      default:
        return "새로운 문서를 만들어보세요.";
    }
  };

  // 사용 가능한 태그 및 카테고리 (임시 데이터)
  const availableTags = ["프로젝트", "회의록", "계획", "보고서", "아이디어"];
  const availableCategories = ["회의록", "보고서", "계획서", "가이드"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                대시보드
              </Link>
              <div className="h-6 border-l border-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">문서 관리</h1>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                leftIcon={<PlusIcon className="w-4 h-4" />}
                onClick={handleCreateDocument}
              >
                새 문서
              </Button>

              <Button
                variant="outline"
                leftIcon={<DocumentTextIcon className="w-4 h-4" />}
                onClick={handleCreateFromTemplate}
              >
                템플릿에서 만들기
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm",
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={cn(
                      "ml-2 py-0.5 px-2 rounded-full text-xs",
                      activeTab === tab.id
                        ? "bg-primary-100 text-primary-600"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* 필터 및 검색 */}
        <DocumentFilters
          filters={filters}
          onFiltersChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showTemplateFilter={
            activeTab === "public" || activeTab === "templates"
          }
          availableTags={availableTags}
          availableCategories={availableCategories}
          className="mb-6"
        />

        {/* 문서 목록 */}
        <DocumentList
          documents={documents}
          loading={isLoading}
          error={error}
          emptyMessage={getEmptyMessage()}
          emptyDescription={getEmptyDescription()}
          onShare={activeTab === "my" ? handleShare : undefined}
          onDelete={activeTab === "my" ? handleDelete : undefined}
          onDuplicate={handleDuplicate}
          showActions={activeTab === "my"}
          viewMode={viewMode}
        />

        {/* 페이지네이션 (향후 구현) */}
        {documents.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white px-4 py-2 rounded-lg border text-sm text-gray-500">
              총 {currentQuery.data?.total || 0}개 문서
            </div>
          </div>
        )}
      </main>

      {/* 문서 생성 모달 */}
      <CreateDocumentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleDocumentCreated}
      />

      {/* 템플릿에서 문서 생성 모달 */}
      <CreateFromTemplateModal
        isOpen={showCreateFromTemplateModal}
        onClose={() => setShowCreateFromTemplateModal(false)}
        onSuccess={handleDocumentCreated}
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
            "{selectedDocument?.title}" 문서를 다른 사용자와 공유하세요.
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
              onClick={confirmDelete}
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
            "{selectedDocument?.title}" 문서를 정말 삭제하시겠습니까?
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

export default DocumentsPage;
