import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams?.path || [];

    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const admin = getSupabaseAdmin();
    let primaryBucket = "guide_documents";
    let objectPath = "";

    if (pathSegments[0] === "guide_documents" || pathSegments[0] === "avatars") {
      primaryBucket = pathSegments[0];
      objectPath = pathSegments.slice(1).join("/");
    } else {
      objectPath = pathSegments.join("/");
    }

    if (!objectPath) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Try primary bucket first
    let { data, error } = await admin.storage
      .from(primaryBucket)
      .download(objectPath);

    // If not found in primary bucket and bucket was not explicitly prefixed, try the other bucket
    if ((error || !data) && pathSegments[0] !== "guide_documents" && pathSegments[0] !== "avatars") {
      const fallbackBucket = primaryBucket === "guide_documents" ? "avatars" : "guide_documents";
      const fallbackRes = await admin.storage
        .from(fallbackBucket)
        .download(objectPath);
      if (!fallbackRes.error && fallbackRes.data) {
        data = fallbackRes.data;
        error = null;
      }
    }

    if (error || !data) {
      return new NextResponse("Avatar not found", { 
        status: 404,
        headers: {
          "Cache-Control": "public, max-age=300",
        }
      });
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = (objectPath.split(".").pop() || "jpg").toLowerCase();
    const contentType = data.type || MIME_MAP[ext] || "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error serving avatar";
    console.error("Avatar serving error:", message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
