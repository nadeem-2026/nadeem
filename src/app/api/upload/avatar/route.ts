import { NextResponse, type NextRequest } from "next/server";
import { authClient } from "@/lib/auth/server";
import { getSupabaseAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
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
        { error: "يجب تسجيل الدخول لرفع الصورة الشخصية" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "لم يتم تحديد أي صورة للرفع" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "حجم الصورة يتجاوز الحد الأقصى المسموح (10 ميجابايت)" },
        { status: 400 }
      );
    }

    const mimeType = file.type || "application/octet-stream";
    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();

    const isAllowedType =
      ALLOWED_IMAGE_TYPES.includes(mimeType) ||
      ["jpg", "jpeg", "png", "webp"].includes(fileExt);

    if (!isAllowedType) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. الصيغ المقبولة: JPG, PNG, WEBP" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    let targetBucket = "avatars";

    // Ensure bucket exists in storage
    try {
      const { data: buckets } = await admin.storage.listBuckets();
      if (!buckets?.some((b) => b.name === "avatars")) {
        await admin.storage.createBucket("avatars", {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_IMAGE_TYPES,
        });
      }
    } catch {
      targetBucket = "guide_documents";
    }

    const randomName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt === "jpeg" ? "jpg" : fileExt}`;
    const filePath = `${user.id}/${randomName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let uploadRes = await admin.storage
      .from(targetBucket)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    // Fallback to guide_documents if avatars bucket failed
    if (uploadRes.error && targetBucket !== "guide_documents") {
      targetBucket = "guide_documents";
      uploadRes = await admin.storage
        .from(targetBucket)
        .upload(filePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });
    }

    if (uploadRes.error) {
      return NextResponse.json(
        { error: uploadRes.error.message || "تعذر رفع الصورة الشخصية، يرجى المحاولة لاحقاً" },
        { status: 500 }
      );
    }

    const publicUrl = `/api/avatar/${targetBucket}/${filePath}`;

    // Update user's profile avatar_url immediately
    try {
      await admin.from("profiles").update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
    } catch {
      // Non-blocking: form action also passes avatar_url
    }

    return NextResponse.json({
      success: true,
      path: filePath,
      url: publicUrl,
      bucket: targetBucket,
      name: file.name,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء رفع الصورة";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
