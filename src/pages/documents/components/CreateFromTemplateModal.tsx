import React, { useState } from "react";
import { Modal, Button, Input, Spinner } from "@/components/ui";
import { useCreateFromTemplate, useTemplates } from "@/hooks/useDocuments";
import { useToastContext } from "@/providers/ToastProvider";
import { DocumentTextIcon, TagIcon } from "@heroicons/react/24/outline";
import type { Document } from "@/types/document.types";

interface CreateFromTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (documentId: string) => void;
  preselectedTemplate?: Document;
}

const CreateFromTemplateModal: React.FC<CreateFromTemplateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedTemplate,
}) => {
  const toast = useToastContext();
  const createFromTemplateMutation = useCreateFromTemplate();
  const templatesQuery = useTemplates({ limit: 50 });

  const [selectedTemplate, setSelectedTemplate] = useState<Document | null>(
    preselectedTemplate || null
  );
  const [documentTitle, setDocumentTitle] = useState("");
  const [titleError, setTitleError] = useState("");

  // 템플릿 선택
  const handleTemplateSelect = (template: Document) => {
    setSelectedTemplate(template);
    // 템플릿 이름을 기반으로 기본 제목 생성
    setDocumentTitle(`${template.title} - 복사본`);
    setTitleError("");
  };

  // 제목 변경
  const handleTitleChange = (value: string) => {
    setDocumentTitle(value);
    if (titleError) {
      setTitleError("");
    }
  };

  // 폼 검증
  const validateForm = (): boolean => {
    if (!selectedTemplate) {
      toast.error("템플릿 선택", "템플릿을 먼저 선택해주세요.");
      return false;
    }

    if (!documentTitle.trim()) {
      setTitleError("문서 제목을 입력해주세요.");
      return false;
    }

    if (documentTitle.length > 200) {
      setTitleError("제목은 200자 이하로 입력해주세요.");
      return false;
    }

    return true;
  };

  // 문서 생성
  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const document = await createFromTemplateMutation.mutateAsync({
        templateId: selectedTemplate!.id,
        title: documentTitle.trim(),
      });

      toast.success(
        "문서 생성 완료",
        "템플릿으로부터 새 문서가 생성되었습니다."
      );

      // 폼 초기화
      resetForm();

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess(document.id);
      }

      onClose();
    } catch (error: any) {
      toast.error(
        "문서 생성 실패",
        error.message || "문서 생성 중 오류가 발생했습니다."
      );
    }
  };

  // 폼 초기화
  const resetForm = () => {
    if (!preselectedTemplate) {
      setSelectedTemplate(null);
    }
    setDocumentTitle("");
    setTitleError("");
  };

  // 모달 닫기
  const handleClose = () => {
    if (createFromTemplateMutation.isPending) {
      return;
    }
    resetForm();
    onClose();
  };

  // 내용 미리보기
  const getPreviewContent = (content: string, maxLength = 100) => {
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

  const templates = templatesQuery.data?.items || [];
  const isLoading = templatesQuery.isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="템플릿에서 문서 만들기"
      size="xl"
      closeOnBackdropClick={!createFromTemplateMutation.isPending}
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createFromTemplateMutation.isPending}
          >
            취소
          </Button>
          <Button
            onClick={handleCreate}
            loading={createFromTemplateMutation.isPending}
            disabled={createFromTemplateMutation.isPending || !selectedTemplate}
          >
            문서 생성
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 문서 제목 */}
        {selectedTemplate && (
          <Input
            label="새 문서 제목"
            value={documentTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="문서 제목을 입력하세요"
            error={titleError}
            required
            disabled={createFromTemplateMutation.isPending}
            maxLength={200}
          />
        )}

        {/* 템플릿 선택 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            템플릿 선택
            {!preselectedTemplate && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">사용 가능한 템플릿이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${
                      selectedTemplate?.id === template.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {template.title}
                    </h4>
                    {selectedTemplate?.id === template.id && (
                      <div className="flex-shrink-0 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-2 h-2 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 카테고리 */}
                  {template.templateCategory && (
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                        {template.templateCategory}
                      </span>
                    </div>
                  )}

                  {/* 내용 미리보기 */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {getPreviewContent(template.content) ||
                      "내용 미리보기가 없습니다."}
                  </p>

                  {/* 태그 */}
                  {template.metadata?.tags &&
                    template.metadata.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <TagIcon className="w-3 h-3 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {template.metadata.tags
                            .slice(0, 2)
                            .map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="text-xs text-gray-500"
                              >
                                #{tag}
                              </span>
                            ))}
                          {template.metadata.tags.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{template.metadata.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {/* 소유자 */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      작성자: {template.owner.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 선택된 템플릿 정보 */}
        {selectedTemplate && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              선택된 템플릿: {selectedTemplate.title}
            </h4>
            <p className="text-sm text-blue-800">
              이 템플릿의 내용을 복사하여 새로운 문서를 만듭니다. 생성 후에는
              독립적인 문서로 편집할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export { CreateFromTemplateModal };
