import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
  PaintBrushIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

interface DocumentEditorProps {
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

export interface CollaboratorCursor {
  id: string;
  username: string;
  color: string;
  position: number;
  selection?: { start: number; end: number };
}

interface EditorState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isList: boolean;
  isNumberedList: boolean;
  isCode: boolean;
  fontSize: number;
  fontFamily: string;
}

interface UndoRedoState {
  content: string;
  selection: { start: number; end: number };
  timestamp: number;
}

const EnhancedDocumentEditor: React.FC<DocumentEditorProps> = ({
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
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isList: false,
    isNumberedList: false,
    isCode: false,
    fontSize: 14,
    fontFamily: "Arial",
  });

  // 저장 관련 상태
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 실행 취소/다시 실행
  const [undoStack, setUndoStack] = useState<UndoRedoState[]>([]);
  const [redoStack, setRedoStack] = useState<UndoRedoState[]>([]);
  const [currentSelection, setCurrentSelection] = useState({
    start: 0,
    end: 0,
  });

  // 변경사항 추적
  const [isComposing, setIsComposing] = useState(false);
  const lastContentRef = useRef(content);

  // 에디터 내용 업데이트
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const startOffset = range?.startOffset || 0;
      const endOffset = range?.endOffset || 0;

      editorRef.current.innerHTML = content;

      // 커서 위치 복원
      try {
        if (selection && range) {
          const newRange = document.createRange();
          const textNode = editorRef.current.firstChild;
          if (textNode) {
            newRange.setStart(
              textNode,
              Math.min(startOffset, textNode.textContent?.length || 0)
            );
            newRange.setEnd(
              textNode,
              Math.min(endOffset, textNode.textContent?.length || 0)
            );
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      } catch (error) {
        console.warn("Failed to restore cursor position:", error);
      }
    }
  }, [content]);

  // 자동 저장 설정
  useEffect(() => {
    if (autoSave && onSave && hasUnsavedChanges) {
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
  }, [content, autoSave, autoSaveInterval, hasUnsavedChanges]);

  // 언두/리두 상태 저장
  const saveToUndoStack = useCallback(() => {
    if (!editorRef.current) return;

    const newState: UndoRedoState = {
      content: editorRef.current.innerHTML,
      selection: currentSelection,
      timestamp: Date.now(),
    };

    setUndoStack((prev) => {
      const newStack = [...prev, newState];
      // 최대 50개까지만 저장
      return newStack.slice(-50);
    });

    // 새로운 변경사항이 있으면 redo 스택 클리어
    setRedoStack([]);
  }, [currentSelection]);

  // 자동 저장 실행
  const handleAutoSave = async () => {
    if (onSave && !readOnly && hasUnsavedChanges) {
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
  };

  // 수동 저장
  const handleManualSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave();
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Manual save failed:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // 에디터 내용 변경 처리
  const handleContentChange = useCallback(() => {
    if (editorRef.current && !readOnly && !isComposing) {
      const newContent = editorRef.current.innerHTML;
      if (newContent !== lastContentRef.current) {
        lastContentRef.current = newContent;
        onChange(newContent);
        setHasUnsavedChanges(true);

        // 500ms 후에 언두 스택에 저장 (너무 자주 저장하지 않도록)
        setTimeout(saveToUndoStack, 500);
      }
    }
  }, [onChange, readOnly, isComposing, saveToUndoStack]);

  // 선택 영역 변경 처리
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const start = range.startOffset;
      const end = range.endOffset;

      setCurrentSelection({ start, end });
      onSelectionChange?.({ start, end });

      // 포맷팅 상태 업데이트
      updateEditorState();
    }
  }, [onSelectionChange]);

  // 포맷팅 적용
  const applyFormat = (command: string, value?: string) => {
    if (readOnly) return;

    saveToUndoStack();
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
      isCode: false,
      fontSize: parseInt(document.queryCommandValue("fontSize")) || 14,
      fontFamily: document.queryCommandValue("fontName") || "Arial",
    });
  };

  // 언두/리두 기능
  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const currentState: UndoRedoState = {
      content: editorRef.current?.innerHTML || "",
      selection: currentSelection,
      timestamp: Date.now(),
    };

    const lastState = undoStack[undoStack.length - 1];

    setRedoStack((prev) => [...prev, currentState]);
    setUndoStack((prev) => prev.slice(0, -1));

    if (editorRef.current) {
      editorRef.current.innerHTML = lastState.content;
      onChange(lastState.content);
      setHasUnsavedChanges(true);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const currentState: UndoRedoState = {
      content: editorRef.current?.innerHTML || "",
      selection: currentSelection,
      timestamp: Date.now(),
    };

    const nextState = redoStack[redoStack.length - 1];

    setUndoStack((prev) => [...prev, currentState]);
    setRedoStack((prev) => prev.slice(0, -1));

    if (editorRef.current) {
      editorRef.current.innerHTML = nextState.content;
      onChange(nextState.content);
      setHasUnsavedChanges(true);
    }
  };

  // 키보드 단축키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;

    const isCtrl = e.ctrlKey || e.metaKey;

    // 저장 (Ctrl+S)
    if (isCtrl && e.key === "s") {
      e.preventDefault();
      handleManualSave();
      return;
    }

    // 언두 (Ctrl+Z)
    if (isCtrl && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }

    // 리두 (Ctrl+Y or Ctrl+Shift+Z)
    if (isCtrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
      return;
    }

    // 포맷팅 단축키
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

  // 링크 삽입
  const insertLink = () => {
    if (readOnly) return;
    const url = prompt("링크 URL을 입력하세요:");
    if (url) {
      applyFormat("createLink", url);
    }
  };

  // 이미지 삽입
  const insertImage = () => {
    if (readOnly) return;
    const url = prompt("이미지 URL을 입력하세요:");
    if (url) {
      applyFormat("insertImage", url);
    }
  };

  // 협업자 커서 렌더링
  const renderCollaboratorCursors = () => {
    if (!editorRef.current || collaborators.length === 0) return null;

    return collaborators.map((collaborator) => (
      <div
        key={collaborator.id}
        className="absolute pointer-events-none z-10"
        style={{
          // 실제로는 텍스트 위치를 계산해서 커서 위치를 정해야 함
          // 여기서는 간단한 예시
          left: `${collaborator.position * 8}px`,
          top: "0px",
        }}
      >
        <div
          className="w-0.5 h-6 relative"
          style={{ backgroundColor: collaborator.color }}
        >
          <div
            className="absolute -top-6 left-0 px-2 py-1 text-xs text-white rounded whitespace-nowrap"
            style={{ backgroundColor: collaborator.color }}
          >
            {collaborator.username}
          </div>
        </div>
      </div>
    ));
  };

  // 마지막 저장 시간 포맷팅
  const getLastSavedText = () => {
    if (isSaving) return "저장 중...";
    if (hasUnsavedChanges) return "저장되지 않은 변경사항";
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
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {/* 실행 취소/다시 실행 */}
            <div className="flex items-center space-x-1 pr-3 border-r border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="h-8 w-8 p-0"
                title="실행 취소 (Ctrl+Z)"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="h-8 w-8 p-0"
                title="다시 실행 (Ctrl+Y)"
              >
                <ArrowUturnRightIcon className="w-4 h-4" />
              </Button>
            </div>

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

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const color = prompt(
                    "텍스트 색상을 입력하세요 (예: #ff0000):"
                  );
                  if (color) applyFormat("foreColor", color);
                }}
                className="h-8 w-8 p-0"
                title="텍스트 색상"
              >
                <PaintBrushIcon className="w-4 h-4" />
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
            <div className="flex items-center space-x-1 pr-3 border-r border-gray-200">
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

            {/* 폰트 설정 */}
            <div className="flex items-center space-x-2">
              <select
                value={editorState.fontFamily}
                onChange={(e) => applyFormat("fontName", e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
              </select>

              <select
                value={editorState.fontSize}
                onChange={(e) => applyFormat("fontSize", e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="1">8pt</option>
                <option value="2">10pt</option>
                <option value="3">12pt</option>
                <option value="4">14pt</option>
                <option value="5">18pt</option>
                <option value="6">24pt</option>
                <option value="7">36pt</option>
              </select>
            </div>
          </div>

          {/* 저장 상태 및 버튼 */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* 저장 상태 */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {isSaving ? (
                <>
                  <Spinner size="xs" />
                  <span>저장 중...</span>
                </>
              ) : (
                <span className={hasUnsavedChanges ? "text-orange-600" : ""}>
                  {getLastSavedText()}
                </span>
              )}
            </div>

            {/* 수동 저장 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
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
            readOnly ? "bg-gray-50 cursor-default" : "bg-white cursor-text",
            className
          )}
          style={{
            minHeight: "500px",
            fontFamily: editorState.fontFamily,
            fontSize: `${editorState.fontSize}px`,
          }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        />

        {/* 협업자 커서 */}
        {renderCollaboratorCursors()}

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

export default EnhancedDocumentEditor;
