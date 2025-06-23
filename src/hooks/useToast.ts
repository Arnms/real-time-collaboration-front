import { useState, useCallback } from "react";
import type { ToastData } from "@/components/ui/Toast";

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (
      type: ToastData["type"],
      title: string,
      message?: string,
      duration?: number
    ) => {
      const newToast: ToastData = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        title,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
      return newToast.id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // 편의 함수들
  const success = useCallback(
    (title: string, message?: string) => addToast("success", title, message),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => addToast("error", title, message),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => addToast("warning", title, message),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => addToast("info", title, message),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };
};
