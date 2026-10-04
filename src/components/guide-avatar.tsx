import Image from "next/image";

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  if (parts.length === 1 && parts[0].length === 1) return parts[0].toUpperCase();
  return "N";
}

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
  if (src) {
    return <Image src={src} alt={name} width={size} height={size} className={className} />;
  }
  
  return (
    <div className={`guide-avatar-fallback ${className}`} aria-label={name}>
      {getInitials(name)}
    </div>
  );
}
