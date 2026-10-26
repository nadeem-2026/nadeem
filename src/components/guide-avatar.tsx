"use client";

import { UserAvatar } from "./user-avatar";

export function GuideAvatar({ 
  src, 
  name, 
  className = "", 
  size = 400 
}: { 
  src?: string | null; 
  name: string; 
  className?: string;
  size?: number;
}) {
  return (
    <UserAvatar
      src={src}
      name={name}
      size={size}
      className={className}
      role="guide"
    />
  );
}
