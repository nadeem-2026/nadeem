/**
 * Avatar Resolution & Formatting Utility
 * Handles resolving internal storage paths, private bucket objects,
 * external OAuth URLs, and generating initials for fallback badges.
 */

export function getInitials(name: string): string {
  if (!name || typeof name !== "string") return "N";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0][0] || "";
    const second = parts[1][0] || "";
    return (first + second).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length === 1) {
    return parts[0].toUpperCase();
  }
  return "N";
}

/**
 * Resolves any raw avatar string (storage path, direct URL, data URI, or proxy path)
 * into a valid, safe, browser-loadable URL.
 */
export function resolveAvatarUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // 1. Data URLs or blob URLs (live preview / canvas exports)
  if (trimmed.startsWith("data:image/") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // 2. Already routed through our image proxy
  if (trimmed.startsWith("/api/avatar/")) {
    return trimmed;
  }

  // 3. Supabase Storage URLs (public or authenticated)
  // E.g. http://127.0.0.1:54321/storage/v1/object/public/guide_documents/userId/filename.jpg
  // Or https://xyz.supabase.co/storage/v1/object/authenticated/guide_documents/userId/filename.jpg
  const storageMatch = trimmed.match(/\/storage\/v1\/object\/(?:public|authenticated)\/([^/]+)\/(.+)$/);
  if (storageMatch) {
    const [, bucket, objectPath] = storageMatch;
    return `/api/avatar/${bucket}/${objectPath}`;
  }

  // 4. External full URLs (Google Auth, Unsplash, CDN)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // If it points to a local or hosted Supabase guide_documents or avatars bucket
    if (trimmed.includes("/guide_documents/")) {
      const parts = trimmed.split("/guide_documents/");
      if (parts[1]) return `/api/avatar/guide_documents/${parts[1]}`;
    }
    if (trimmed.includes("/avatars/")) {
      const parts = trimmed.split("/avatars/");
      if (parts[1]) return `/api/avatar/avatars/${parts[1]}`;
    }
    return trimmed;
  }

  // 5. Relative storage paths (e.g. "userId/filename.jpg" or "guide_documents/userId/filename.jpg")
  const cleanPath = trimmed.replace(/^\/+/, "");
  if (cleanPath.startsWith("guide_documents/")) {
    return `/api/avatar/${cleanPath}`;
  }
  if (cleanPath.startsWith("avatars/")) {
    return `/api/avatar/${cleanPath}`;
  }

  // Standard relative storage path: treat as guide_documents or avatars
  return `/api/avatar/guide_documents/${cleanPath}`;
}
