import React from "react";
import { cn } from "@/utils/cn";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name = "",
  size = "md",
  color,
  showOnlineIndicator = false,
  isOnline = false,
  className,
}) => {
  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const indicatorSizes = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
    xl: "h-4 w-4",
  };

  // 이름에서 이니셜 추출
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // 이름 기반 색상 생성
  const getColorFromName = (name: string) => {
    if (color) return color;

    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-rose-500",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) & 0xffffffff;
    }

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium text-white",
          sizeClasses[size],
          !src && getColorFromName(name)
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name}
            className="h-full w-full rounded-full object-cover"
            onError={(e) => {
              // 이미지 로드 실패 시 이니셜로 대체
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="font-semibold select-none">
            {getInitials(name) || "?"}
          </span>
        )}
      </div>

      {/* 온라인 인디케이터 */}
      {showOnlineIndicator && (
        <span
          className={cn(
            "absolute -bottom-0 -right-0 block rounded-full border-2 border-white",
            indicatorSizes[size],
            isOnline ? "bg-green-400" : "bg-gray-300"
          )}
        />
      )}
    </div>
  );
};

export { Avatar };
