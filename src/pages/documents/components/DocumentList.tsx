import React from "react";
import { DocumentCard } from "./DocumentCard";
import { Spinner } from "@/components/ui";
import type { Document } from "@/types/document.types";

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  emptyDescription?: string;
  onShare?: (document: Document) => void;
  onVisibilitySettings?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDuplicate?: (document: Document) => void;
  onNavigate?: (documentId: string) => void;
  showActions?: boolean;
  viewMode?: "grid" | "list";
  className?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading = false,
  error = null,
  emptyMessage = "문서가 없습니다",
  emptyDescription = "새로운 문서를 만들어보세요.",
  onShare,
  onVisibilitySettings,
  onDelete,
  onDuplicate,
  onNavigate,
  showActions = true,
  viewMode = "grid",
  className,
}) => {
  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-500">문서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
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
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // 빈 상태
  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  // 그리드 뷰
  if (viewMode === "grid") {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      >
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onShare={onShare}
            onVisibilitySettings={onVisibilitySettings}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onNavigate={onNavigate}
            showActions={showActions}
          />
        ))}
      </div>
    );
  }

  // 리스트 뷰
  return (
    <div className={`space-y-4 ${className}`}>
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onShare={onShare}
          onVisibilitySettings={onVisibilitySettings}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onNavigate={onNavigate}
          showActions={showActions}
          className="flex-row" // 리스트 모드용 스타일링
        />
      ))}
    </div>
  );
};

export { DocumentList };
