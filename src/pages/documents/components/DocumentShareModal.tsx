import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Avatar } from "@/components/ui";
import {
  ShareIcon,
  UserPlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useToastContext } from "@/providers/ToastProvider";
import {
  useShareDocument,
  useBulkShareDocument,
  useDocumentPermissions,
  useUpdateDocumentPermission,
  useRemoveDocumentPermission,
} from "@/hooks/useDocuments";
import type { Document } from "@/types/document.types";

interface DocumentShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

type PermissionLevel = "viewer" | "commenter" | "editor";

const permissionLabels = {
  owner: { label: "소유자", description: "모든 권한" },
  editor: { label: "편집자", description: "편집 및 댓글 가능" },
  commenter: { label: "댓글 작성자", description: "댓글만 가능" },
  viewer: { label: "뷰어", description: "읽기 전용" },
};

const DocumentShareModal: React.FC<DocumentShareModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const toast = useToastContext();
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPermission, setNewUserPermission] =
    useState<PermissionLevel>("viewer");
  const [shareUrl, setShareUrl] = useState("");
  const [urlCopied, setUrlCopied] = useState(false);

  // API 훅들
  const shareDocumentMutation = useShareDocument(document.id);
  const bulkShareMutation = useBulkShareDocument(document.id);
  const permissionsQuery = useDocumentPermissions(document.id, isOpen);
  const updatePermissionMutation = useUpdateDocumentPermission(document.id);
  const removePermissionMutation = useRemoveDocumentPermission(document.id);

  const permissions = permissionsQuery.data || [];

  // 공유 URL 생성
  useEffect(() => {
    if (document.isPublic) {
      const url = `${window.location.origin}/documents/public/${document.id}`;
      setShareUrl(url);
    }
  }, [document]);

  // 새 사용자 추가
  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      toast.error("이메일 입력", "이메일 주소를 입력해주세요.");
      return;
    }

    try {
      await shareDocumentMutation.mutateAsync({
        email: newUserEmail,
        permission: newUserPermission,
      });

      toast.success("공유 완료", `${newUserEmail}님에게 문서를 공유했습니다.`);
      setNewUserEmail("");
      setNewUserPermission("viewer");
    } catch (error: any) {
      toast.error("공유 실패", error.message);
    }
  };

  // 권한 변경
  const handlePermissionChange = async (
    userId: string,
    permission: PermissionLevel
  ) => {
    try {
      await updatePermissionMutation.mutateAsync({
        userId,
        permission,
      });
      toast.success("권한 변경", "사용자 권한이 변경되었습니다.");
    } catch (error: any) {
      toast.error("권한 변경 실패", error.message);
    }
  };

  // 사용자 제거
  const handleRemoveUser = async (userId: string, username: string) => {
    if (!confirm(`${username}님의 접근 권한을 제거하시겠습니까?`)) {
      return;
    }

    try {
      await removePermissionMutation.mutateAsync(userId);
      toast.success("권한 제거", `${username}님의 접근 권한이 제거되었습니다.`);
    } catch (error: any) {
      toast.error("권한 제거 실패", error.message);
    }
  };

  // URL 복사
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setUrlCopied(true);
      toast.success("복사 완료", "공유 링크가 클립보드에 복사되었습니다.");
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (error) {
      toast.error("복사 실패", "링크 복사에 실패했습니다.");
    }
  };

  // 이메일로 초대
  const handleEmailInvite = () => {
    const subject = encodeURIComponent(`문서 공유: ${document.title}`);
    const body = encodeURIComponent(
      `${document.title} 문서를 공유합니다.\n\n링크: ${shareUrl}\n\n이 링크를 클릭하여 문서를 확인하세요.`
    );
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`"${document.title}" 공유`}
      size="lg"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 사용자 추가 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">사용자 초대</h3>

          <div className="flex space-x-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="이메일 주소를 입력하세요"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                leftIcon={<UserPlusIcon className="w-5 h-5" />}
                onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
              />
            </div>

            <div className="relative">
              <select
                value={newUserPermission}
                onChange={(e) =>
                  setNewUserPermission(e.target.value as PermissionLevel)
                }
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="viewer">뷰어</option>
                <option value="commenter">댓글 작성자</option>
                <option value="editor">편집자</option>
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <Button
              onClick={handleAddUser}
              loading={shareDocumentMutation.isPending}
              disabled={shareDocumentMutation.isPending}
            >
              초대
            </Button>
          </div>
        </div>

        {/* 공유 링크 섹션 */}
        {document.isPublic && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">공유 링크</h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-white"
                    leftIcon={<ShareIcon className="w-5 h-5" />}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleCopyUrl}
                  leftIcon={
                    urlCopied ? (
                      <CheckIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    )
                  }
                >
                  {urlCopied ? "복사됨" : "복사"}
                </Button>
                <Button variant="outline" onClick={handleEmailInvite}>
                  이메일로 공유
                </Button>
              </div>

              <p className="text-sm text-gray-600">
                이 링크를 가진 모든 사용자가 문서를 볼 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* 현재 공유된 사용자 목록 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            접근 권한이 있는 사용자 ({permissions.length}명)
          </h3>

          {permissionsQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center space-x-3 p-3"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      name={permission.user.username}
                      src={permission.user.avatarUrl}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {permission.user.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {permission.user.email}
                      </p>
                      {permission.invitedAt && (
                        <p className="text-xs text-gray-400">
                          {new Date(permission.invitedAt).toLocaleDateString(
                            "ko-KR"
                          )}
                          에 초대됨
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {permission.permission === "owner" ? (
                      <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                        {permissionLabels.owner.label}
                      </span>
                    ) : (
                      <>
                        <select
                          value={permission.permission}
                          onChange={(e) =>
                            handlePermissionChange(
                              permission.user.id,
                              e.target.value as PermissionLevel
                            )
                          }
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={
                            updatePermissionMutation.isPending ||
                            removePermissionMutation.isPending
                          }
                        >
                          <option value="viewer">뷰어</option>
                          <option value="commenter">댓글 작성자</option>
                          <option value="editor">편집자</option>
                        </select>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveUser(
                              permission.user.id,
                              permission.user.username
                            )
                          }
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={
                            updatePermissionMutation.isPending ||
                            removePermissionMutation.isPending
                          }
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 권한 설명 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">권한 안내</h4>
          <div className="space-y-1 text-sm text-blue-800">
            {Object.entries(permissionLabels).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{value.label}:</span>
                <span>{value.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentShareModal;
