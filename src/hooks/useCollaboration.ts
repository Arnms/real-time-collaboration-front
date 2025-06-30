import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";
import { useToastContext } from "@/providers/ToastProvider";
import type {
  CollaborationUser,
  TextOperation,
  DocumentJoinedData,
  TextChangedData,
  CursorMovedData,
  UserJoinedData,
  OnlineUsersData,
} from "@/types/collaboration.types";

interface UseCollaborationOptions {
  documentId: string;
  enabled?: boolean;
  onDocumentUpdate?: (content: string, version: number) => void;
  onError?: (error: string) => void;
}

interface CollaborationState {
  isConnected: boolean;
  connectionStatus: "connected" | "connecting" | "disconnected";
  onlineUsers: CollaborationUser[];
  documentVersion: number;
  lastSyncTime: Date | undefined;
}

export const useCollaboration = ({
  documentId,
  enabled = true,
  onDocumentUpdate,
  onError,
}: UseCollaborationOptions) => {
  const { user } = useAuth();
  const toast = useToastContext();
  const socketRef = useRef<Socket | null>(null);

  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    connectionStatus: "disconnected",
    onlineUsers: [],
    documentVersion: 1,
    lastSyncTime: undefined,
  });

  // WebSocket 서버 URL
  const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || "http://localhost:3001";

  // 소켓 연결
  const connect = useCallback(() => {
    if (!enabled || !user || !documentId || socketRef.current?.connected) {
      return;
    }

    setState((prev) => ({ ...prev, connectionStatus: "connecting" }));

    try {
      const socket = io(`${WEBSOCKET_URL}/collaboration`, {
        transports: ["websocket", "polling"],
        timeout: 5000,
        retries: 3,
      });

      socketRef.current = socket;

      // 연결 성공
      socket.on("connect", () => {
        console.log("WebSocket connected");
        setState((prev) => ({
          ...prev,
          isConnected: true,
          connectionStatus: "connected",
          lastSyncTime: new Date(),
        }));

        // 문서 참여
        socket.emit("join-document", {
          documentId,
          token: localStorage.getItem("accessToken"),
        });
      });

      // 연결 실패
      socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          connectionStatus: "disconnected",
        }));

        if (onError) {
          onError("실시간 연결에 실패했습니다.");
        }
      });

      // 연결 끊김
      socket.on("disconnect", (reason) => {
        console.log("WebSocket disconnected:", reason);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          connectionStatus: "disconnected",
        }));

        if (reason === "io server disconnect") {
          // 서버에서 연결을 끊은 경우 재연결 시도
          setTimeout(() => {
            if (enabled) {
              connect();
            }
          }, 2000);
        }
      });

      // 문서 참여 성공
      socket.on("document-joined", (data: DocumentJoinedData) => {
        console.log("Document joined:", data);
        setState((prev) => ({
          ...prev,
          documentVersion: data.document.version,
          lastSyncTime: new Date(),
        }));

        if (onDocumentUpdate) {
          onDocumentUpdate(data.document.content, data.document.version);
        }
      });

      // 사용자 참여
      socket.on("user-joined", (data: UserJoinedData) => {
        console.log("User joined:", data.user);
        setState((prev) => ({
          ...prev,
          onlineUsers: [...prev.onlineUsers, data.user],
        }));

        toast.info("사용자 참여", `${data.user.username}님이 참여했습니다.`);
      });

      // 사용자 떠남
      socket.on(
        "user-left",
        (data: { user: Pick<CollaborationUser, "id" | "username"> }) => {
          console.log("User left:", data.user);
          setState((prev) => ({
            ...prev,
            onlineUsers: prev.onlineUsers.filter((u) => u.id !== data.user.id),
          }));

          toast.info("사용자 떠남", `${data.user.username}님이 나갔습니다.`);
        }
      );

      // 온라인 사용자 목록 업데이트
      socket.on("online-users", (data: OnlineUsersData) => {
        console.log("Online users updated:", data.users);
        setState((prev) => ({
          ...prev,
          onlineUsers: data.users,
        }));
      });

      // 텍스트 변경 수신
      socket.on("text-changed", (data: TextChangedData) => {
        console.log("Text changed:", data);
        setState((prev) => ({
          ...prev,
          documentVersion: data.version,
          lastSyncTime: new Date(),
        }));

        // 다른 사용자의 변경사항이면 문서 업데이트
        if (data.author.id !== user.id && onDocumentUpdate) {
          // TODO: 실제로는 여기서 Operational Transformation 적용 필요
          console.log("Received text change from:", data.author.username);
        }
      });

      // 커서 이동
      socket.on("cursor-moved", (data: CursorMovedData) => {
        console.log("Cursor moved:", data);
        // 다른 사용자의 커서 위치 업데이트
        if (data.user.id !== user.id) {
          setState((prev) => ({
            ...prev,
            onlineUsers: prev.onlineUsers.map((u) =>
              u.id === data.user.id
                ? { ...u, cursorPosition: data.position }
                : u
            ),
          }));
        }
      });

      // 타이핑 상태 변경
      socket.on(
        "typing-status-changed",
        (data: {
          user: CollaborationUser;
          isTyping: boolean;
          timestamp: string;
        }) => {
          console.log("Typing status changed:", data);
          if (data.user.id !== user.id) {
            setState((prev) => ({
              ...prev,
              onlineUsers: prev.onlineUsers.map((u) =>
                u.id === data.user.id ? { ...u, isTyping: data.isTyping } : u
              ),
            }));
          }
        }
      );

      // 에러 처리
      socket.on("error", (data: { message: string }) => {
        console.error("WebSocket error:", data.message);
        toast.error("실시간 동기화 오류", data.message);

        if (onError) {
          onError(data.message);
        }
      });
    } catch (error) {
      console.error("Failed to create socket connection:", error);
      setState((prev) => ({
        ...prev,
        connectionStatus: "disconnected",
      }));
    }
  }, [
    enabled,
    user,
    documentId,
    onDocumentUpdate,
    onError,
    toast,
    WEBSOCKET_URL,
  ]);

  // 연결 해제
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      connectionStatus: "disconnected",
      onlineUsers: [],
    }));
  }, []);

  // 텍스트 변경 전송
  const sendTextChange = useCallback(
    (operation: TextOperation, version: number) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("text-change", {
          documentId,
          operation,
          version,
        });
      }
    },
    [documentId]
  );

  // 커서 위치 전송
  const sendCursorPosition = useCallback(
    (position: number, selection?: { start: number; end: number }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("cursor-position", {
          documentId,
          position,
          selection,
        });
      }
    },
    [documentId]
  );

  // 타이핑 상태 전송
  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("typing-status", {
          documentId,
          isTyping,
        });
      }
    },
    [documentId]
  );

  // 컴포넌트 마운트/언마운트 시 연결/해제
  useEffect(() => {
    if (enabled && user && documentId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, user, documentId, connect, disconnect]);

  // 문서 변경 시 재연결
  useEffect(() => {
    if (enabled && user && documentId && socketRef.current) {
      disconnect();
      setTimeout(() => {
        connect();
      }, 100);
    }
  }, [documentId]);

  return {
    // 상태
    isConnected: state.isConnected,
    connectionStatus: state.connectionStatus,
    onlineUsers: state.onlineUsers,
    documentVersion: state.documentVersion,
    lastSyncTime: state.lastSyncTime,

    // 액션
    connect,
    disconnect,
    sendTextChange,
    sendCursorPosition,
    sendTypingStatus,
  };
};
