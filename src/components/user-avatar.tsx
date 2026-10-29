"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { resolveAvatarUrl, getInitials } from "@/lib/avatar";

export interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  role?: "guide" | "tourist" | "admin";
  rounded?: "full" | "2xl" | "xl" | "none" | "top";
}

export function UserAvatar({
  src,
  name,
  size = 96,
  className = "",
  role,
  rounded = "full",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = useMemo(() => resolveAvatarUrl(src), [src]);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = getInitials(name);
  const roundedClass = 
    rounded === "full" ? "rounded-full" : 
    rounded === "2xl" ? "rounded-2xl" : 
    rounded === "xl" ? "rounded-xl" : 
    rounded === "top" ? "rounded-t-2xl" : "";
  const isCover = rounded === "none" || rounded === "top";

  if (!resolvedUrl || hasError) {
    return (
      <div
        className={`user-avatar-fallback inline-flex items-center justify-center font-bold select-none text-white shadow-xs ${roundedClass} ${className}`}
        style={{
          width: isCover ? "100%" : size,
          height: isCover ? "100%" : size,
          fontSize: isCover ? "2.2rem" : Math.max(12, Math.round(size * 0.38)),
          backgroundColor: role === "guide" ? "var(--color-primary, #0e3526)" : "var(--color-primary, #0e3526)",
          color: "#fff",
          border: isCover ? "none" : "2px solid var(--nadeem-sand, rgba(197, 160, 89, 0.4))",
          aspectRatio: isCover ? undefined : "1 / 1",
          flexShrink: 0,
        }}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`user-avatar-wrapper relative inline-block overflow-hidden shadow-xs ${roundedClass} ${className}`}
      style={{
        width: isCover ? "100%" : size,
        height: isCover ? "100%" : size,
        aspectRatio: isCover ? undefined : "1 / 1",
        border: isCover ? "none" : "2px solid var(--nadeem-sand, rgba(197, 160, 89, 0.4))",
        backgroundColor: "var(--background-alt, #f8f6f0)",
        flexShrink: 0,
      }}
    >
      <Image
        src={resolvedUrl}
        alt={name || "User Avatar"}
        width={size}
        height={size}
        unoptimized
        onError={() => setHasError(true)}
        className="w-full h-full"
        style={{
          objectFit: "cover",
          objectPosition: "center 25%",
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
