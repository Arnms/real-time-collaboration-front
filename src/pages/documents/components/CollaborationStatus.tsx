import React from "react";
import { Avatar } from "@/components/ui";
import {
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

interface OnlineUser {
  id: string;
  username: string;
  color: string;
  isTyping?: boolean;
  cursorPosition?: number;
}

interface CollaborationStatusProps {
  onlineUsers: OnlineUser[];
  connectionStatus: "connected" | "connecting" | "disconnected";
  documentVersion: number;
  lastSyncTime?: Date;
  className?: string;
}

const CollaborationStatus: React.FC<CollaborationStatusProps> = ({
  onlineUsers,
  connectionStatus,
  documentVersion,
  lastSyncTime,
  className,
}) => {
  // 연결 상태에 따른 스타일
  const getConnectionStatusConfig = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          icon: CheckCircleIcon,
          color: "text-green-600",
          bgColor: "bg-green-100",
          text: "연결됨",
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
      default:
        return {
          icon: WifiIcon,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          text: "알 수 없음",
        };
    }
  };

  const statusConfig = getConnectionStatusConfig();
  const StatusIcon = statusConfig.icon;

  // 타이핑 중인 사용자들
  const typingUsers = onlineUsers.filter((user) => user.isTyping);

  // 마지막 동기화 시간 포맷팅
  const getLastSyncText = () => {
    if (!lastSyncTime) return "";

    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 5) {
      return "방금 동기화됨";
    } else if (diffSeconds < 60) {
      return `${diffSeconds}초 전 동기화됨`;
    } else {
      const diffMinutes = Math.floor(diffSeconds / 60);
      return `${diffMinutes}분 전 동기화됨`;
    }
  };

  return (
    <div className={cn("bg-white border-t border-gray-200", className)}>
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 온라인 사용자들 */}
          <div className="flex items-center space-x-4">
            {/* 사용자 아바타들 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                협업 중:
              </span>

              {onlineUsers.length === 0 ? (
                <span className="text-sm text-gray-500">혼자 작업 중</span>
              ) : (
                <div className="flex items-center space-x-1">
                  {onlineUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="relative">
                      <Avatar
                        name={user.username}
                        size="xs"
                        color={user.color}
                        showOnlineIndicator
                        isOnline
                        className={cn(
                          "transition-all duration-200",
                          user.isTyping &&
                            "ring-2 ring-blue-400 ring-opacity-75"
                        )}
                      />

                      {/* 타이핑 인디케이터 */}
                      {user.isTyping && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  ))}

                  {onlineUsers.length > 5 && (
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-medium text-gray-600">
                      +{onlineUsers.length - 5}
                    </div>
                  )}

                  <span className="text-sm text-gray-500 ml-2">
                    ({onlineUsers.length}명)
                  </span>
                </div>
              )}
            </div>

            {/* 타이핑 상태 */}
            {typingUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-100" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-200" />
                </div>
                <span className="text-xs text-blue-600">
                  {typingUsers.length === 1
                    ? `${typingUsers[0].username}님이 입력 중...`
                    : `${typingUsers.length}명이 입력 중...`}
                </span>
              </div>
            )}
          </div>

          {/* 오른쪽: 연결 상태 및 버전 정보 */}
          <div className="flex items-center space-x-4">
            {/* 문서 버전 */}
            <div className="text-xs text-gray-500">버전 {documentVersion}</div>

            {/* 마지막 동기화 시간 */}
            {lastSyncTime && (
              <div className="text-xs text-gray-500">{getLastSyncText()}</div>
            )}

            {/* 연결 상태 */}
            <div className="flex items-center space-x-2">
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
          </div>
        </div>

        {/* 확장된 사용자 목록 (많은 사용자가 있을 때) */}
        {onlineUsers.length > 3 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 px-2 py-1 bg-gray-50 rounded-full"
                >
                  <Avatar name={user.username} size="xs" color={user.color} />
                  <span className="text-xs text-gray-700">{user.username}</span>
                  {user.isTyping && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 연결 문제 알림 */}
        {connectionStatus === "disconnected" && (
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
    </div>
  );
};

export { CollaborationStatus };
