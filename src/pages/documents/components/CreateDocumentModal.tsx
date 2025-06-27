import React, { useState } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { useCreateDocument } from "@/hooks/useDocuments";
import { useToastContext } from "@/providers/ToastProvider";
import type { CreateDocumentRequest } from "@/types/document.types";

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (documentId: string) => void;
}

const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToastContext();
  const createDocumentMutation = useCreateDocument();

  const [formData, setFormData] = useState<CreateDocumentRequest>({
    title: "",
    content: "",
    isPublic: false,
    isTemplate: false,
    templateCategory: "",
    metadata: {
      tags: [],
    },
  });

  const [errors, setErrors] = useState<Partial<CreateDocumentRequest>>({});
  const [tags, setTags] = useState<string>("");

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Partial<CreateDocumentRequest> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "문서 제목을 입력해주세요.";
    } else if (formData.title.length > 200) {
      newErrors.title = "제목은 200자 이하로 입력해주세요.";
    }

    if (formData.isTemplate && !formData.templateCategory?.trim()) {
      newErrors.templateCategory = "템플릿 카테고리를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 입력 변경 핸들러
  const handleInputChange = (
    field: keyof CreateDocumentRequest,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 실시간 에러 클리어
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // 태그 처리
  const handleTagsChange = (value: string) => {
    setTags(value);
    const tagArray = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: tagArray,
      },
    }));
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const document = await createDocumentMutation.mutateAsync(formData);

      toast.success(
        "문서 생성 완료",
        "새로운 문서가 성공적으로 생성되었습니다."
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
    setFormData({
      title: "",
      content: "",
      isPublic: false,
      isTemplate: false,
      templateCategory: "",
      metadata: {
        tags: [],
      },
    });
    setTags("");
    setErrors({});
  };

  // 모달 닫기 처리
  const handleClose = () => {
    if (createDocumentMutation.isPending) {
      return; // 생성 중일 때는 닫기 방지
    }
    resetForm();
    onClose();
  };

  // 템플릿 카테고리 옵션
  const templateCategories = [
    "회의록",
    "보고서",
    "계획서",
    "가이드",
    "프로젝트 문서",
    "기타",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 문서 만들기"
      size="lg"
      closeOnBackdropClick={!createDocumentMutation.isPending}
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createDocumentMutation.isPending}
          >
            취소
          </Button>
          <Button
            type="submit"
            form="create-document-form"
            loading={createDocumentMutation.isPending}
            disabled={createDocumentMutation.isPending}
          >
            문서 생성
          </Button>
        </div>
      }
    >
      <form
        id="create-document-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* 문서 제목 */}
        <Input
          label="문서 제목"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="문서 제목을 입력하세요"
          error={errors.title}
          required
          disabled={createDocumentMutation.isPending}
          maxLength={200}
        />

        {/* 초기 내용 */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            초기 내용 (선택사항)
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder="문서의 초기 내용을 입력하세요..."
            rows={4}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={createDocumentMutation.isPending}
          />
          <p className="text-xs text-gray-500">
            비워두면 빈 문서로 시작합니다.
          </p>
        </div>

        {/* 태그 */}
        <Input
          label="태그"
          value={tags}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="태그1, 태그2, 태그3"
          helperText="쉼표(,)로 구분하여 입력하세요"
          disabled={createDocumentMutation.isPending}
        />

        {/* 문서 옵션 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">문서 옵션</h3>

          <div className="space-y-3">
            {/* 공개/비공개 */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  handleInputChange("isPublic", e.target.checked)
                }
                disabled={createDocumentMutation.isPending}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                공개 문서로 설정
              </span>
            </label>

            {formData.isPublic && (
              <p className="text-xs text-gray-500 ml-6">
                모든 사용자가 이 문서를 볼 수 있습니다.
              </p>
            )}

            {/* 템플릿 */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isTemplate}
                onChange={(e) =>
                  handleInputChange("isTemplate", e.target.checked)
                }
                disabled={createDocumentMutation.isPending}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                템플릿으로 설정
              </span>
            </label>

            {formData.isTemplate && (
              <div className="ml-6 space-y-2">
                <p className="text-xs text-gray-500">
                  다른 사용자가 이 문서를 템플릿으로 사용할 수 있습니다.
                </p>

                <div className="max-w-xs">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    템플릿 카테고리 *
                  </label>
                  <select
                    value={formData.templateCategory}
                    onChange={(e) =>
                      handleInputChange("templateCategory", e.target.value)
                    }
                    disabled={createDocumentMutation.isPending}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">카테고리 선택</option>
                    {templateCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.templateCategory && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.templateCategory}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 선택된 태그 미리보기 */}
        {formData.metadata?.tags && formData.metadata.tags.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              선택된 태그
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.metadata.tags.map((tag: any, index: any) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export { CreateDocumentModal };
