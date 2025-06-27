import React from "react";
import { Link } from "react-router-dom";
import {
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { Avatar, Button } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { Document } from "@/types/document.types";

interface DocumentCardProps {
  document: Document;
  onShare?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDuplicate?: (document: Document) => void;
  showActions?: boolean;
  className?: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onShare,
  onDelete,
  onDuplicate,
  showActions = true,
  className,
}) => {
  // 권한에 따른 색상
  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "owner":
        return "text-green-600 bg-green-50";
      case "editor":
        return "text-blue-600 bg-blue-50";
      case "commenter":
        return "text-yellow-600 bg-yellow-50";
      case "viewer":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // 내용 미리보기 (Markdown 제거)
  const getPreviewContent = (content: string, maxLength = 120) => {
    const plainText = content
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\n+/g, " ")
      .trim();

    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;
  };

  // 시간 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? "방금 전" : `${diffMinutes}분 전`;
      }
      return `${diffHours}시간 전`;
    } else if (diffDays === 1) {
      return "어제";
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR");
    }
  };

  // 사용자 권한 찾기
  const userPermission = document.permissions?.[0]?.permission || "viewer";

  return (
    <div
      className={cn(
        "group bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200",
        className
      )}
    >
      {/* 카드 상단 */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {document.title}
            </h3>

            {/* 공개/비공개 표시 */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {document.isPublic ? (
                <GlobeAltIcon
                  className="w-4 h-4 text-green-500"
                  title="공개 문서"
                />
              ) : (
                <LockClosedIcon
                  className="w-4 h-4 text-gray-400"
                  title="비공개 문서"
                />
              )}

              {document.isTemplate && (
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                  템플릿
                </span>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          {showActions && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onShare(document);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ShareIcon className="w-4 h-4" />
                </Button>
              )}

              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <EllipsisHorizontalIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* 권한 배지 */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              getPermissionColor(userPermission)
            )}
          >
            {userPermission === "owner" && "소유자"}
            {userPermission === "editor" && "편집자"}
            {userPermission === "commenter" && "댓글 작성자"}
            {userPermission === "viewer" && "뷰어"}
          </span>

          <span className="text-xs text-gray-500">v{document.version}</span>
        </div>
      </div>

      {/* 카드 본문 - 클릭 가능 영역 */}
      <Link to={`/documents/${document.id}`} className="block">
        <div className="px-4 pb-2">
          {/* 내용 미리보기 */}
          <p className="text-sm text-gray-600 line-clamp-3 mb-3 leading-relaxed">
            {getPreviewContent(document.content) || "내용이 없습니다."}
          </p>

          {/* 태그들 */}
          {document.metadata?.tags && document.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {document.metadata.tags
                .slice(0, 3)
                .map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              {document.metadata.tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-400">
                  +{document.metadata.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* 카드 하단 */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          {/* 소유자 정보 */}
          <div className="flex items-center space-x-2">
            <Avatar
              name={document.owner.username}
              size="xs"
              className="flex-shrink-0"
            />
            <span className="text-xs text-gray-500 truncate">
              {document.owner.username}
            </span>
          </div>

          {/* 협업자 및 시간 */}
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            {/* 협업자 수 */}
            {document.permissions && document.permissions.length > 1 && (
              <div className="flex items-center space-x-1">
                <UserGroupIcon className="w-3 h-3" />
                <span>{document.permissions.length}</span>
              </div>
            )}

            {/* 마지막 수정 시간 */}
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>{formatDate(document.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DocumentCard };
