/**
 * Client-Side Image Normalization & Processing Utility
 * Ensures avatars and profile portraits are:
 * 1. Perfectly 1:1 square-cropped from the center.
 * 2. Standardized to optimal resolution (e.g., 800x800).
 * 3. High quality yet lightweight (compressed WebP / JPEG ~100-250KB).
 */

export interface ProcessAvatarOptions {
  targetSize?: number; // Target square dimension (default: 800)
  quality?: number; // Quality between 0 and 1 (default: 0.88)
  format?: "image/webp" | "image/jpeg";
}

export interface ProcessedAvatarResult {
  file: File;
  previewUrl: string;
  originalWidth: number;
  originalHeight: number;
  croppedSize: number;
}

export async function processAvatarFile(
  inputFile: File,
  options: ProcessAvatarOptions = {}
): Promise<ProcessedAvatarResult> {
  const targetSize = options.targetSize || 800;
  const quality = options.quality ?? 0.88;
  const preferredFormat = options.format || "image/webp";

  // Check if running in browser with Canvas support
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      file: inputFile,
      previewUrl: "",
      originalWidth: targetSize,
      originalHeight: targetSize,
      croppedSize: targetSize,
    };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(inputFile);
    const img = new Image();

    img.onload = () => {
      try {
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;

        // 1. Calculate center square crop
        const minDim = Math.min(origWidth, origHeight);
        const sx = Math.floor((origWidth - minDim) / 2);
        const sy = Math.floor((origHeight - minDim) / 2);

        // 2. Set canvas dimension (capped at targetSize or minDim if smaller)
        const finalDim = Math.min(minDim, targetSize);

        const canvas = document.createElement("canvas");
        canvas.width = finalDim;
        canvas.height = finalDim;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          // Canvas 2d context unavailable, fallback to original
          URL.revokeObjectURL(objectUrl);
          resolve({
            file: inputFile,
            previewUrl: objectUrl,
            originalWidth: origWidth,
            originalHeight: origHeight,
            croppedSize: minDim,
          });
          return;
        }

        // 3. High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw center-square crop scaled to target dimensions
        ctx.drawImage(
          img,
          sx,
          sy,
          minDim,
          minDim,
          0,
          0,
          finalDim,
          finalDim
        );

        // 4. Export to blob with preferred format
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              resolve({
                file: inputFile,
                previewUrl: URL.createObjectURL(inputFile),
                originalWidth: origWidth,
                originalHeight: origHeight,
                croppedSize: minDim,
              });
              return;
            }

            const extension = preferredFormat === "image/webp" ? "webp" : "jpg";
            const baseName = inputFile.name.replace(/\.[^/.]+$/, "");
            const processedFile = new File([blob], `${baseName}_portrait.${extension}`, {
              type: blob.type || preferredFormat,
              lastModified: Date.now(),
            });

            const previewUrl = URL.createObjectURL(blob);

            resolve({
              file: processedFile,
              previewUrl,
              originalWidth: origWidth,
              originalHeight: origHeight,
              croppedSize: finalDim,
            });
          },
          preferredFormat,
          quality
        );
      } catch (err) {
        console.warn("Avatar processing error, falling back to original:", err);
        resolve({
          file: inputFile,
          previewUrl: objectUrl,
          originalWidth: 0,
          originalHeight: 0,
          croppedSize: 0,
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        file: inputFile,
        previewUrl: "",
        originalWidth: 0,
        originalHeight: 0,
        croppedSize: 0,
      });
    };

    img.src = objectUrl;
  });
}
