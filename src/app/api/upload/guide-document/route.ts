import { NextResponse, type NextRequest } from "next/server";
import { authClient } from "@/lib/auth/server";
import { getSupabaseAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const client = await authClient();
    if (!client) {
      return NextResponse.json(
        { error: "خدمة المصادقة غير متوفرة حالياً" },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لإتمام رفع الملفات" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "لم يتم تحديد أي ملف للرفع" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "حجم الملف يتجاوز الحد الأقصى المسموح (10 ميجابايت)" },
        { status: 400 }
      );
    }

    // Determine MIME type
    const mimeType = file.type || "application/octet-stream";
    const fileExt = (file.name.split(".").pop() || "bin").toLowerCase();

    const isAllowedType =
      ALLOWED_MIME_TYPES.includes(mimeType) ||
      ["jpg", "jpeg", "png", "webp", "pdf"].includes(fileExt);

    if (!isAllowedType) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. الصيغ المقبولة: JPG, PNG, WEBP, PDF" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Ensure bucket exists in storage
    try {
      const { data: buckets } = await admin.storage.listBuckets();
      if (!buckets?.some((b) => b.name === "guide_documents")) {
        await admin.storage.createBucket("guide_documents", {
          public: false,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        });
      }
    } catch {
      // Non-blocking: bucket may already exist or listing restricted
    }

    const randomName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${randomName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error: uploadError } = await admin.storage
      .from("guide_documents")
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "تعذر رفع الملف، يرجى المحاولة مرة أخرى" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      path: data?.path || filePath,
      name: file.name,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء رفع الملف";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
