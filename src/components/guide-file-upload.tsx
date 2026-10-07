"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export function GuideFileUpload({ name, label, required, acceptedTypes, defaultValue }: { name: string, label: string, required?: boolean, acceptedTypes?: string, defaultValue?: string | null }) {
  const [fileUrl, setFileUrl] = useState<string | null>(defaultValue || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Unauthenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userData.user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('guide_documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      setFileUrl(data.path);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
      <label style={{ fontWeight: 'bold' }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input 
        type="file" 
        accept={acceptedTypes} 
        onChange={handleUpload}
        disabled={uploading}
        required={required && !fileUrl}
        className="input"
      />
      {uploading && <small style={{ color: '#666' }}>Uploading...</small>}
      {error && <small style={{ color: 'red' }}>{error}</small>}
      {fileUrl && (
        <div style={{ color: 'green', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✓ Uploaded successfully
          <input type="hidden" name={name} value={fileUrl} />
        </div>
      )}
    </div>
  );
}
