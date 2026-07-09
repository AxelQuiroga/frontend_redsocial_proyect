import { httpClient } from "@/infrastructure/http/httpClient";
import type { PresignResponse, ConfirmResponse, PostImage } from "@/types/image";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 5;

export interface FileValidationError {
  field: "type" | "size" | "count";
  message: string;
}

export function validateFiles(files: File[]): FileValidationError[] {
  const errors: FileValidationError[] = [];

  if (files.length > MAX_FILES) {
    errors.push({ field: "count", message: `Máximo ${MAX_FILES} imágenes` });
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type as any)) {
      errors.push({
        field: "type",
        message: `"${file.name}" no es un formato válido. Usá JPEG, PNG, WebP o GIF.`,
      });
    }
    if (file.size > MAX_SIZE) {
      errors.push({
        field: "size",
        message: `"${file.name}" pesa más de 5 MB`,
      });
    }
  }

  return errors;
}

export const imageService = {
  /** Paso 1: Obtener URLs presignadas para subir a S3 */
  presign: async (
    files: { name: string; type: string; size: number }[]
  ): Promise<PresignResponse> => {
    const res = await httpClient.post("/posts/images/presign", { files });
    return res.data;
  },

  /** Paso 2: Subir archivo directo a S3 vía presigned URL */
  uploadToS3: (
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (e) => {
        if (onProgress && e.lengthComputable) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed (HTTP ${xhr.status})`));
        }
      };

      xhr.onerror = () => reject(new Error("Error de red al subir imagen"));
      xhr.ontimeout = () => reject(new Error("Timeout al subir imagen"));
      xhr.send(file);
    });
  },

  /** Paso 3: Confirmar upload en el backend (procesa con Sharp y registra en DB) */
  confirm: async (
    postId: string,
    images: { tempKey: string; key: string }[]
  ): Promise<ConfirmResponse> => {
    const res = await httpClient.post(`/posts/${postId}/images/confirm`, {
      images,
    });
    return res.data;
  },

  /** Obtener imágenes de un post */
  getPostImages: async (postId: string): Promise<PostImage[]> => {
    const res = await httpClient.get(`/posts/${postId}/images`);
    return res.data.images ?? res.data;
  },

  /** Eliminar imagen (soft delete) */
  deleteImage: async (imageId: string): Promise<void> => {
    await httpClient.delete(`/posts/images/${imageId}`);
  },

  /** Reordenar imágenes de un post */
  reorderImages: async (
    postId: string,
    images: { imageId: string; order: number }[]
  ): Promise<void> => {
    await httpClient.put(`/posts/${postId}/images/reorder`, { images });
  },
};
