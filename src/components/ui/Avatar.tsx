import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

export interface AvatarProps {
  src?: string;
  avatar?: string;
  avatarUrl?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  avatar,
  avatarUrl,
  name = "User",
  size = "md",
  isOnline,
  className,
}) => {
  const resolvedSrc = (src || avatar || avatarUrl || "").trim();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [resolvedSrc]);

  const getInitials = (n: string) => {
    if (!n || !n.trim()) return "U";
    const parts = n.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  const badgeSizes = {
    xs: "w-1.5 h-1.5 border-[1px]",
    sm: "w-2 h-2 border-[1.5px]",
    md: "w-2.5 h-2.5 border-2",
    lg: "w-3.5 h-3.5 border-2",
    xl: "w-5 h-5 border-2",
  };

  return (
    <div className={cn("relative inline-block select-none shrink-0", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center font-semibold bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-inner",
          sizes[size],
        )}
      >
        {resolvedSrc && !imageError ? (
          <img
            src={resolvedSrc}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {typeof isOnline === "boolean" && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-white dark:border-slate-900",
            isOnline ? "bg-emerald-500" : "bg-gray-400",
            badgeSizes[size],
          )}
          title={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
};
