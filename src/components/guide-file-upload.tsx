"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  UploadCloud, 
  FileCheck2, 
  Image as ImageIcon, 
  AlertCircle, 
  Trash2, 
  Loader2
} from "lucide-react";


interface GuideFileUploadProps {
  name: string;
  label: string;
  required?: boolean;
  acceptedTypes?: string;
  defaultValue?: string | null;
  hint?: string;
}

export function GuideFileUpload({ 
  name, 
  label, 
  required, 
  acceptedTypes = "image/jpeg, image/png, application/pdf", 
  defaultValue,
  hint
}: GuideFileUploadProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(defaultValue || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(defaultValue ? defaultValue.split("/").pop() || defaultValue : null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = fileUrl ? /\.(jpg|jpeg|png|webp)$/i.test(fileUrl) : false;

  const uploadFile = async (file: File) => {
    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("حجم الملف يتجاوز الحد الأقصى المسموح (10 ميجابايت)");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("يجب تسجيل الدخول لإتمام رفع الملفات");

      const fileExt = file.name.split('.').pop() || "bin";
      const randomName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${userData.user.id}/${randomName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('guide_documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      setFileUrl(data.path);
      setFileName(file.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "تعذر رفع الملف، يرجى المحاولة مرة أخرى";
      setError(msg);
    } finally {
      setUploading(false);
    }

  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileUrl(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[var(--color-text)] flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        {hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        accept={acceptedTypes} 
        onChange={handleInputChange}
        disabled={uploading}
        className="hidden"
        id={`file-input-${name}`}
      />

      {/* Hidden input to pass file path to server actions */}
      <input type="hidden" name={name} value={fileUrl || ""} />

      {fileUrl ? (
        /* File Uploaded State */
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-4 transition shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              {isImage ? <ImageIcon size={20} /> : <FileCheck2 size={20} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-emerald-950 truncate block">
                  {fileName || label}
                </span>
                <span className="text-[11px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  ✓ تم الرفع بنجاح
                </span>
              </div>
              <p className="text-xs text-emerald-700 m-0 mt-0.5">
                الملف محفوظ ومؤمن للاعتماد
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition"
            >
              استبدال
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
              title="حذف الملف"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Box */
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`file-dropzone-box ${isDragging ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-[1.01]' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-4 gap-2">
              <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
              <span className="text-sm font-semibold text-[var(--color-primary)]">جارٍ رفع وتشفير الملف...</span>
              <span className="text-xs text-[var(--muted)]">يرجى الانتظار بضع ثوانٍ</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--border)] text-[var(--color-primary)] flex items-center justify-center shadow-xs">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--color-text)] m-0">
                  انقر لاختيار الملف أو اسحبه وأفلته هنا
                </p>
                <p className="text-xs text-[var(--muted)] m-0 mt-1">
                  صيغ مقبولة: PDF, JPG, PNG (الحد الأقصى: 10 ميجابايت)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
