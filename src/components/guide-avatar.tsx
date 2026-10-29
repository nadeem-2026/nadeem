"use client";

import { UserAvatar } from "./user-avatar";

export function GuideAvatar({ 
  src, 
  name, 
  className = "", 
  size = 400,
  rounded = "full",
}: { 
  src?: string | null; 
  name: string; 
  className?: string;
  size?: number;
  rounded?: "full" | "2xl" | "xl" | "none" | "top";
}) {
  return (
    <UserAvatar
      src={src}
      name={name}
      size={size}
      className={className}
      role="guide"
      rounded={rounded}
    />
  );
}
