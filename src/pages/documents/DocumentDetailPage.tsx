import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WifiIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Button, Modal, Input, Spinner } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/providers/ToastProvider";
import { useCollaboration } from "@/hooks/useCollaboration";
import {
  useDocument,
  useUpdateDocument,
  useDeleteDocument,
  useDuplicateDocument,
  useMyDocumentPermission,
} from "@/hooks/useDocuments";
import { cn } from "@/utils/cn";
import type { Document } from "@/types/document.types";

// Enhanced Document Editor 타입 정의
interface CollaboratorCursor {
  id: string;
  username: string;
  color: string;
  position: number;
  selection?: { start: number; end: number };
  isTyping?: boolean;
}

interface EnhancedDocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => Promise<void>;
  onSelectionChange?: (selection: { start: number; end: number }) => void;
  readOnly?: boolean;
  placeholder?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
  collaborators?: CollaboratorCursor[];
  className?: string;
}

// Enhanced Document Editor 컴포넌트 (import 대신 임시로 여기에 정의)
const EnhancedDocumentEditor: React.FC<EnhancedDocumentEditorProps> = ({
  content,
  onChange,
  onSave,
  onSelectionChange,
  readOnly = false,
  placeholder = "문서 내용을 입력하세요...",
  autoSave = true,
  autoSaveInterval = 3000,
  collaborators = [],
  className,
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [currentSelection, setCurrentSelection] = useState({
    start: 0,
    end: 0,
  });
  const lastContentRef = React.useRef(content);

  // 자동 저장 설정
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (autoSave && onSave && hasUnsavedChanges && !isComposing) {
      timeout = setTimeout(async () => {
        if (hasUnsavedChanges) {
          setIsSaving(true);
          try {
            await onSave();
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
          } catch (error) {
            console.error("Auto save failed:", error);
          } finally {
            setIsSaving(false);
          }
        }
      }, autoSaveInterval);
    }
    return () => clearTimeout(timeout);
  }, [autoSave, onSave, hasUnsavedChanges, autoSaveInterval, isComposing]);

  // 에디터 내용 업데이트
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      const selection = window.getSelection();
      const cursorPos = selection?.anchorOffset || 0;

      editorRef.current.innerHTML = content;

      // 커서 위치 복원 시도
      try {
        if (selection && editorRef.current.firstChild) {
          const range = document.createRange();
          const textNode = editorRef.current.firstChild;
          const maxPos = textNode.textContent?.length || 0;
          range.setStart(textNode, Math.min(cursorPos, maxPos));
          range.setEnd(textNode, Math.min(cursorPos, maxPos));
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (error) {
        console.warn("Failed to restore cursor position:", error);
      }
    }
  }, [content]);

  const handleContentChange = React.useCallback(() => {
    if (editorRef.current && !readOnly && !isComposing) {
      const newContent = editorRef.current.innerHTML;
      if (newContent !== lastContentRef.current) {
        lastContentRef.current = newContent;
        onChange(newContent);
        setHasUnsavedChanges(true);
      }
    }
  }, [onChange, readOnly, isComposing]);

  const handleSelectionChange = React.useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const start = range.startOffset;
      const end = range.endOffset;

      setCurrentSelection({ start, end });
      onSelectionChange?.({ start, end });
    }
  }, [onSelectionChange]);

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave();
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Manual save failed:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    }
  };

  const applyFormat = (command: string, value?: string) => {
    if (readOnly) return;
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;

    const isCtrl = e.ctrlKey || e.metaKey;

    if (isCtrl && e.key === "s") {
      e.preventDefault();
      handleSave();
      return;
    }

    if (isCtrl && e.key === "b") {
      e.preventDefault();
      applyFormat("bold");
      return;
    }

    if (isCtrl && e.key === "i") {
      e.preventDefault();
      applyFormat("italic");
      return;
    }

    if (isCtrl && e.key === "u") {
      e.preventDefault();
      applyFormat("underline");
      return;
    }
  };

  const getLastSavedText = () => {
    if (isSaving) return "저장 중...";
    if (hasUnsavedChanges) return "저장되지 않은 변경사항";
    if (!lastSaved) return "";

    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes === 0) return "방금 저장됨";
    if (diffMinutes < 60) return `${diffMinutes}분 전 저장됨`;
    return lastSaved.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 툴바 */}
      {!readOnly && (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {/* 텍스트 포맷팅 */}
            <div className="flex items-center space-x-1 pr-3 border-r border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormat("bold")}
                className="h-8 w-8 p-0"
                title="굵게 (Ctrl+B)"
              >
                <strong className="text-sm">B</strong>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormat("italic")}
                className="h-8 w-8 p-0"
                title="기울임 (Ctrl+I)"
              >
                <em className="text-sm">I</em>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormat("underline")}
                className="h-8 w-8 p-0"
                title="밑줄 (Ctrl+U)"
              >
                <span className="text-sm underline">U</span>
              </Button>
            </div>

            {/* 리스트 */}
            <div className="flex items-center space-x-1 pr-3 border-r border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormat("insertUnorderedList")}
                className="h-8 w-8 p-0"
                title="글머리 기호"
              >
                •
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormat("insertOrderedList")}
                className="h-8 w-8 p-0"
                title="번호 매기기"
              >
                1.
              </Button>
            </div>

            {/* 기타 도구 */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = prompt("링크 URL을 입력하세요:");
                  if (url) applyFormat("createLink", url);
                }}
                className="h-8 px-2 text-xs"
                title="링크 삽입"
              >
                링크
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const color = prompt(
                    "텍스트 색상을 입력하세요 (예: #ff0000):"
                  );
                  if (color) applyFormat("foreColor", color);
                }}
                className="h-8 px-2 text-xs"
                title="텍스트 색상"
              >
                색상
              </Button>
            </div>
          </div>

          {/* 저장 상태 및 버튼 */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {isSaving && <Spinner size="xs" />}
              <span className={hasUnsavedChanges ? "text-orange-600" : ""}>
                {getLastSavedText()}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              loading={isSaving}
              className={
                hasUnsavedChanges ? "border-orange-300 text-orange-700" : ""
              }
            >
              저장
            </Button>
          </div>
        </div>
      )}

      {/* 에디터 영역 */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => {
            setIsComposing(false);
            handleContentChange();
          }}
          className={cn(
            "w-full h-full p-6 text-base leading-relaxed resize-none border-0 focus:outline-none overflow-y-auto",
            "prose prose-lg max-w-none",
            readOnly ? "bg-gray-50 cursor-default" : "bg-white cursor-text"
          )}
          style={{ minHeight: "500px" }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        />

        {/* 협업자 커서 표시 */}
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="absolute pointer-events-none z-10"
            style={{
              left: `${Math.min(collaborator.position * 8, 90)}%`,
              top: "120px",
            }}
          >
            <div
              className="w-0.5 h-6 relative"
              style={{ backgroundColor: collaborator.color }}
            >
              <div
                className="absolute -top-8 left-0 px-2 py-1 text-xs text-white rounded whitespace-nowrap shadow-lg"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.username}
                {collaborator.isTyping && (
                  <span className="ml-1 animate-pulse">✎</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 플레이스홀더 */}
        {!content && !readOnly && (
          <div className="absolute top-6 left-6 text-gray-400 pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

// 메인 DocumentDetailPage 컴포넌트
const EnhancedDocumentDetailPage: React.FC = () => {
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
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [currentSelection, setCurrentSelection] = useState({
    start: 0,
    end: 0,
  });

  // API 훅들
  const documentQuery = useDocument(id!, !!id);
  const permissionQuery = useMyDocumentPermission(id!, !!id);
  const updateDocumentMutation = useUpdateDocument(id!);
  const deleteDocumentMutation = useDeleteDocument();
  const duplicateDocumentMutation = useDuplicateDocument();

  // 실시간 협업 훅
  const collaboration = useCollaboration({
    documentId: id!,
    enabled: !!id && !!documentQuery.data,
    onDocumentUpdate: (content, version) => {
      setDocumentContent(content);
    },
    onError: (error) => {
      toast.error("실시간 동기화 오류", error);
    },
  });

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

  // 실시간 협업자들을 CollaboratorCursor 형태로 변환
  const collaboratorCursors: CollaboratorCursor[] = collaboration.onlineUsers
    .filter((collaborator) => collaborator.id !== user?.id)
    .map((collaborator) => ({
      id: collaborator.id,
      username: collaborator.username,
      color: collaborator.color,
      position: Math.random() * 100,
      isTyping: collaborator.isTyping,
    }));

  // 문서 내용 변경 핸들러
  const handleContentChange = useCallback(
    (newContent: string) => {
      setDocumentContent(newContent);

      // 타이핑 상태 전송
      if (!isTyping && collaboration.isConnected) {
        setIsTyping(true);
        collaboration.sendTypingStatus(true);
      }

      // 타이핑 중지 타이머 설정
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      const timeout = setTimeout(() => {
        setIsTyping(false);
        if (collaboration.isConnected) {
          collaboration.sendTypingStatus(false);
        }
      }, 1000);

      setTypingTimeout(timeout);

      // 실시간 변경사항 전송
      if (collaboration.isConnected && canEdit) {
        collaboration.sendTextChange(
          {
            type: "insert",
            position: currentSelection.start,
            content: newContent,
          },
          document?.version || 1
        );
      }
    },
    [
      isTyping,
      typingTimeout,
      collaboration,
      document?.version,
      canEdit,
      currentSelection,
    ]
  );

  // 선택 영역 변경 핸들러
  const handleSelectionChange = useCallback(
    (selection: { start: number; end: number }) => {
      setCurrentSelection(selection);

      // 커서 위치 전송
      if (collaboration.isConnected) {
        collaboration.sendCursorPosition(selection.start, selection);
      }
    },
    [collaboration]
  );

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
      setDocumentTitle(document.title);
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
      toast.success("저장 완료", "문서가 저장되었습니다.");
    } catch (error: any) {
      toast.error("저장 실패", error.message);
      throw error;
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

  // 연결 상태에 따른 스타일
  const getConnectionStatusConfig = () => {
    switch (collaboration.connectionStatus) {
      case "connected":
        return {
          icon: CheckCircleIcon,
          color: "text-green-600",
          bgColor: "bg-green-100",
          text: "실시간 연결됨",
        };
      case "connecting":
        return {
          icon: WifiIcon,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          text: "연결 중...",
        };
      case "disconnected":
        return {
          icon: ExclamationTriangleIcon,
          color: "text-red-600",
          bgColor: "bg-red-100",
          text: "연결 끊김",
        };
    }
  };

  const statusConfig = getConnectionStatusConfig();
  const StatusIcon = statusConfig.icon;

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
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
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
                    className="text-xl font-semibold border-0 px-0 focus:ring-0 bg-transparent"
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
              {/* 실시간 상태 */}
              <div className="hidden md:flex items-center space-x-2 text-sm mr-4">
                <div
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full",
                    statusConfig.bgColor
                  )}
                >
                  <StatusIcon className={cn("w-3 h-3", statusConfig.color)} />
                </div>
                <span className={cn("text-xs font-medium", statusConfig.color)}>
                  {statusConfig.text}
                </span>
              </div>

              {/* 협업자 표시 */}
              {collaboration.onlineUsers.length > 0 && (
                <div className="flex items-center space-x-1 mr-4">
                  {collaboration.onlineUsers.slice(0, 3).map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium",
                        collaborator.isTyping &&
                          "ring-2 ring-blue-400 ring-opacity-75"
                      )}
                      style={{ backgroundColor: collaborator.color }}
                      title={collaborator.username}
                    >
                      {collaborator.username.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {collaboration.onlineUsers.length > 3 && (
                    <span className="text-xs text-gray-500 ml-1">
                      +{collaboration.onlineUsers.length - 3}
                    </span>
                  )}
                </div>
              )}

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

              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  leftIcon={<TrashIcon className="w-4 h-4" />}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  삭제
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 에디터 */}
      <div className="flex-1 flex flex-col">
        <EnhancedDocumentEditor
          content={documentContent}
          onChange={handleContentChange}
          onSave={handleSave}
          onSelectionChange={handleSelectionChange}
          readOnly={!canEdit}
          placeholder="문서 내용을 입력하세요..."
          autoSave={true}
          autoSaveInterval={3000}
          collaborators={collaboratorCursors}
          className="flex-1"
        />
      </div>

      {/* 하단 협업 상태 */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* 온라인 사용자 정보 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {collaboration.onlineUsers.length === 0
                  ? "혼자 작업 중"
                  : `${collaboration.onlineUsers.length}명이 함께 작업 중`}
              </span>
            </div>

            {/* 타이핑 중인 사용자 */}
            {collaboration.onlineUsers.some((u) => u.isTyping) && (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-100" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-200" />
                </div>
                <span className="text-xs text-blue-600">
                  {collaboration.onlineUsers
                    .filter((u) => u.isTyping)
                    .map((u) => u.username)
                    .join(", ")}
                  님이 입력 중...
                </span>
              </div>
            )}
          </div>

          {/* 동기화 정보 */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>
              버전 {collaboration.documentVersion || document.version}
            </span>
            {collaboration.lastSyncTime && (
              <span>
                {new Date(collaboration.lastSyncTime).toLocaleTimeString(
                  "ko-KR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                )}{" "}
                동기화
              </span>
            )}
          </div>
        </div>

        {/* 연결 문제 알림 */}
        {collaboration.connectionStatus === "disconnected" && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">
                실시간 동기화가 중단되었습니다. 변경사항이 저장되지 않을 수
                있습니다.
              </span>
            </div>
          </div>
        )}
      </div>

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
              ⚠️ 이 작업은 되돌릴 수 없습니다. 모든 협업자의 접근도 차단됩니다.
            </p>
          </div>
        </div>
      </Modal>

      {/* 공유 모달 */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="문서 공유"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              닫기
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            "{document.title}" 문서 공유 기능이 곧 구현될 예정입니다.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">현재 협업 중인 사용자</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  {collaboration.onlineUsers.map((collaborator) => (
                    <li key={collaborator.id}>
                      {collaborator.username}
                      {collaborator.isTyping && " (입력 중)"}
                    </li>
                  ))}
                  {collaboration.onlineUsers.length === 0 && (
                    <li>현재 온라인 사용자가 없습니다.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* 협업 기능 안내 */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-800">
              <p className="font-medium mb-2">🚀 현재 구현된 협업 기능</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>실시간 온라인 사용자 표시</li>
                <li>타이핑 상태 실시간 공유</li>
                <li>사용자별 커서 색상 표시</li>
                <li>자동 저장 및 동기화</li>
                <li>연결 상태 모니터링</li>
              </ul>
            </div>
          </div>

          {/* 곧 추가될 기능 */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-800">
              <p className="font-medium mb-2">⏳ 곧 추가될 기능</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>실시간 텍스트 변경 동기화</li>
                <li>Operational Transformation</li>
                <li>댓글 및 제안 시스템</li>
                <li>문서 히스토리 및 버전 관리</li>
                <li>고급 권한 관리</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedDocumentDetailPage;
