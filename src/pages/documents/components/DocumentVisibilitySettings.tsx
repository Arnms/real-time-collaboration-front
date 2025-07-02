import React, { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import {
  GlobeAltIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useToastContext } from "@/providers/ToastProvider";
import { useUpdateDocument } from "@/hooks/useDocuments";
import type { Document } from "@/types/document.types";

interface DocumentVisibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  onUpdate?: (updatedDocument: Document) => void;
}

const DocumentVisibilitySettings: React.FC<DocumentVisibilitySettingsProps> = ({
  isOpen,
  onClose,
  document,
  onUpdate,
}) => {
  const toast = useToastContext();
  const updateDocumentMutation = useUpdateDocument(document.id);

  const [isPublic, setIsPublic] = useState(document.isPublic);
  const [isTemplate, setIsTemplate] = useState(document.isTemplate);
  const [templateCategory, setTemplateCategory] = useState(
    document.templateCategory || ""
  );

  // 문서 데이터가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setIsPublic(document.isPublic);
    setIsTemplate(document.isTemplate);
    setTemplateCategory(document.templateCategory || "");
  }, [document]);

  const templateCategories = [
    "회의록",
    "보고서",
    "계획서",
    "가이드",
    "프로젝트 문서",
    "기타",
  ];

  const handleSave = async () => {
    try {
      const updateData: any = {
        isPublic,
        isTemplate,
      };

      // 템플릿인 경우에만 카테고리 설정
      if (isTemplate && templateCategory) {
        updateData.templateCategory = templateCategory;
      } else if (!isTemplate) {
        updateData.templateCategory = null;
      }

      const updatedDocument = await updateDocumentMutation.mutateAsync(
        updateData
      );

      toast.success("설정 변경 완료", "문서의 공개 설정이 변경되었습니다.");

      if (onUpdate) {
        onUpdate(updatedDocument);
      }

      onClose();
    } catch (error: any) {
      toast.error("설정 변경 실패", error.message);
    }
  };

  const handleCancel = () => {
    // 원래 값으로 되돌리기
    setIsPublic(document.isPublic);
    setIsTemplate(document.isTemplate);
    setTemplateCategory(document.templateCategory || "");
    onClose();
  };

  // 변경사항이 있는지 확인
  const hasChanges =
    isPublic !== document.isPublic ||
    isTemplate !== document.isTemplate ||
    templateCategory !== (document.templateCategory || "");

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="문서 공개 설정"
      size="md"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            loading={updateDocumentMutation.isPending}
            disabled={updateDocumentMutation.isPending || !hasChanges}
          >
            저장
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 공개/비공개 설정 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">문서 공개 범위</h3>

          <div className="space-y-3">
            {/* 비공개 옵션 */}
            <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="visibility"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <LockClosedIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900">비공개</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  초대받은 사용자만 접근할 수 있습니다. 링크를 통한 접근은
                  불가능합니다.
                </p>
              </div>
            </label>

            {/* 공개 옵션 */}
            <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="visibility"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <GlobeAltIcon className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900">공개</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  인터넷상의 모든 사용자가 링크를 통해 문서를 볼 수 있습니다.
                </p>
              </div>
            </label>
          </div>

          {/* 공개 문서일 때 추가 정보 */}
          {isPublic && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">공개 문서 주의사항</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>검색 엔진에 노출될 수 있습니다</li>
                    <li>공유 링크를 아는 누구나 접근 가능합니다</li>
                    <li>민감한 정보가 포함되지 않았는지 확인하세요</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 템플릿 설정 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">템플릿 설정</h3>

          <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={isTemplate}
              onChange={(e) => setIsTemplate(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">템플릿으로 사용</span>
              <p className="text-sm text-gray-600 mt-1">
                다른 사용자가 이 문서를 템플릿으로 사용하여 새 문서를 만들 수
                있습니다.
              </p>
            </div>
          </label>

          {/* 템플릿 카테고리 */}
          {isTemplate && (
            <div className="ml-7 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                템플릿 카테고리
              </label>
              <select
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">카테고리 선택</option>
                {templateCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {!templateCategory && (
                <p className="text-sm text-red-600">
                  템플릿으로 설정하려면 카테고리를 선택해주세요.
                </p>
              )}
            </div>
          )}
        </div>

        {/* 현재 설정 요약 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">현재 설정</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              {isPublic ? (
                <EyeIcon className="w-4 h-4 text-green-600" />
              ) : (
                <EyeSlashIcon className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-gray-700">
                {isPublic ? "공개 문서" : "비공개 문서"}
              </span>
            </div>

            {isTemplate && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-600 rounded text-white flex items-center justify-center text-xs">
                  T
                </div>
                <span className="text-gray-700">
                  템플릿{templateCategory && ` (${templateCategory})`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 변경사항이 있을 때 경고 */}
        {hasChanges && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">변경사항이 있습니다</p>
                <p>저장하지 않으면 변경사항이 손실됩니다.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DocumentVisibilitySettings;
