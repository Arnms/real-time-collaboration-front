import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button, Spinner } from "@/components/ui";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  CodeBracketIcon,
  LinkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  readOnly?: boolean;
  placeholder?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
  className?: string;
}

interface EditorState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isList: boolean;
  isNumberedList: boolean;
  isCode: boolean;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  content,
  onChange,
  onSave,
  readOnly = false,
  placeholder = "문서 내용을 입력하세요...",
  autoSave = true,
  autoSaveInterval = 3000,
  className,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isList: false,
    isNumberedList: false,
    isCode: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 에디터 내용 업데이트
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  // 자동 저장 설정
  useEffect(() => {
    if (autoSave && onSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, autoSave, autoSaveInterval]);

  // 자동 저장 실행
  const handleAutoSave = async () => {
    if (onSave && !readOnly) {
      setIsSaving(true);
      try {
        await onSave();
        setLastSaved(new Date());
      } catch (error) {
        console.error("Auto save failed:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // 수동 저장
  const handleManualSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave();
        setLastSaved(new Date());
      } catch (error) {
        console.error("Manual save failed:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // 에디터 내용 변경 처리
  const handleContentChange = useCallback(() => {
    if (editorRef.current && !readOnly) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
    }
  }, [onChange, readOnly]);

  // 포맷팅 적용
  const applyFormat = (command: string, value?: string) => {
    if (readOnly) return;

    document.execCommand(command, false, value);
    updateEditorState();
    handleContentChange();
    editorRef.current?.focus();
  };

  // 에디터 상태 업데이트
  const updateEditorState = () => {
    setEditorState({
      isBold: document.queryCommandState("bold"),
      isItalic: document.queryCommandState("italic"),
      isUnderline: document.queryCommandState("underline"),
      isList: document.queryCommandState("insertUnorderedList"),
      isNumberedList: document.queryCommandState("insertOrderedList"),
      isCode: false, // 커스텀 구현 필요
    });
  };

  // 키보드 단축키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;

    // Ctrl/Cmd + S: 저장
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleManualSave();
      return;
    }

    // Ctrl/Cmd + B: 볼드
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      applyFormat("bold");
      return;
    }

    // Ctrl/Cmd + I: 이탤릭
    if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault();
      applyFormat("italic");
      return;
    }

    // Ctrl/Cmd + U: 언더라인
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      applyFormat("underline");
      return;
    }
  };

  // 링크 삽입
  const insertLink = () => {
    if (readOnly) return;

    const url = prompt("링크 URL을 입력하세요:");
    if (url) {
      applyFormat("createLink", url);
    }
  };

  // 이미지 삽입 (기본 구현)
  const insertImage = () => {
    if (readOnly) return;

    const url = prompt("이미지 URL을 입력하세요:");
    if (url) {
      applyFormat("insertImage", url);
    }
  };

  // 마지막 저장 시간 포맷팅
  const getLastSavedText = () => {
    if (!lastSaved) return "";

    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes === 0) {
      return "방금 저장됨";
    } else if (diffMinutes < 60) {
      return `${diffMinutes}분 전 저장됨`;
    } else {
      return lastSaved.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 툴바 */}
      {!readOnly && (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-1">
            {/* 텍스트 포맷팅 */}
            <div className="flex items-center space-x-1 pr-3 border-r border-gray-200">
              <Button
                variant={editorState.isBold ? "primary" : "ghost"}
                size="sm"
                onClick={() => applyFormat("bold")}
                className="h-8 w-8 p-0"
                title="굵게 (Ctrl+B)"
              >
                <BoldIcon className="w-4 h-4" />
              </Button>

              <Button
                variant={editorState.isItalic ? "primary" : "ghost"}
                size="sm"
                onClick={() => applyFormat("italic")}
                className="h-8 w-8 p-0"
                title="기울임 (Ctrl+I)"
              >
                <ItalicIcon className="w-4 h-4" />
              </Button>

              <Button
                variant={editorState.isUnderline ? "primary" : "ghost"}
                size="sm"
                onClick={() => applyFormat("underline")}
                className="h-8 w-8 p-0"
                title="밑줄 (Ctrl+U)"
              >
                <UnderlineIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* 리스트 */}
            <div className="flex items-center space-x-1 pr-3 border-r border-gray-200">
              <Button
                variant={editorState.isList ? "primary" : "ghost"}
                size="sm"
                onClick={() => applyFormat("insertUnorderedList")}
                className="h-8 w-8 p-0"
                title="글머리 기호"
              >
                <ListBulletIcon className="w-4 h-4" />
              </Button>

              <Button
                variant={editorState.isNumberedList ? "primary" : "ghost"}
                size="sm"
                onClick={() => applyFormat("insertOrderedList")}
                className="h-8 w-8 p-0"
                title="번호 매기기"
              >
                <NumberedListIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* 기타 도구 */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormat("formatBlock", "pre")}
                className="h-8 w-8 p-0"
                title="코드 블록"
              >
                <CodeBracketIcon className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={insertLink}
                className="h-8 w-8 p-0"
                title="링크 삽입"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={insertImage}
                className="h-8 w-8 p-0"
                title="이미지 삽입"
              >
                <PhotoIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 저장 상태 및 버튼 */}
          <div className="flex items-center space-x-3">
            {/* 저장 상태 */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {isSaving ? (
                <>
                  <Spinner size="xs" />
                  <span>저장 중...</span>
                </>
              ) : (
                <span>{getLastSavedText()}</span>
              )}
            </div>

            {/* 수동 저장 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
              loading={isSaving}
            >
              저장
            </Button>
          </div>
        </div>
      )}

      {/* 에디터 영역 */}
      <div className="flex-1 relative">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onMouseUp={updateEditorState}
          onKeyUp={updateEditorState}
          className={cn(
            "w-full h-full p-6 text-base leading-relaxed resize-none border-0 focus:outline-none overflow-y-auto",
            "prose prose-lg max-w-none",
            readOnly ? "bg-gray-50 cursor-default" : "bg-white cursor-text",
            className
          )}
          style={{
            minHeight: "500px",
          }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        />

        {/* 플레이스홀더 (내용이 비어있을 때) */}
        {!content && !readOnly && (
          <div className="absolute top-6 left-6 text-gray-400 pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export { DocumentEditor };
