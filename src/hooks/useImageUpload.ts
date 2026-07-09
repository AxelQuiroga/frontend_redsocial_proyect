import { useState, useCallback, useRef, useEffect } from "react";
import { imageService, validateFiles } from "@/services/imageService";
import type { ImageUploadItem, PostImage } from "@/types/image";

interface UseImageUploadReturn {
  files: ImageUploadItem[];
  addFiles: (fileList: FileList | File[]) => void;
  removeFile: (id: string) => void;
  replaceFile: (id: string, newFile: File) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  uploadAll: (postId: string) => Promise<PostImage[]>;
  isUploading: boolean;
  overallProgress: number;
  error: string | null;
  validationErrors: string[];
  reset: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [files, setFiles] = useState<ImageUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Ref para limpiar URLs al desmontar
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // Ref para acceder al estado actual de files sin closure stale
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Limpiar object URLs al desmontar
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      setError(null);

      const newFiles = Array.from(fileList);
      const remaining = 5 - files.length;

      if (remaining <= 0) {
        setValidationErrors(["Máximo 5 imágenes por post"]);
        return;
      }

      // Validar tipos y tamaños
      const errors = validateFiles(newFiles);
      if (errors.length > 0) {
        setValidationErrors(errors.map((e) => e.message));
        return;
      }

      setValidationErrors([]);

      // Limitar a la cantidad restante
      const validFiles = newFiles.slice(0, remaining);

      const items: ImageUploadItem[] = validFiles.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        objectUrlsRef.current.add(previewUrl);
        return {
          id: crypto.randomUUID(),
          file,
          previewUrl,
          status: "pending",
          progress: 0,
        };
      });

      setFiles((prev) => [...prev, ...items]);
    },
    [files.length]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
        objectUrlsRef.current.delete(item.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const replaceFile = useCallback((id: string, newFile: File) => {
    const newPreviewUrl = URL.createObjectURL(newFile);
    objectUrlsRef.current.add(newPreviewUrl);

    setFiles((prev) => {
      const old = prev.find((f) => f.id === id);
      if (old) {
        URL.revokeObjectURL(old.previewUrl);
        objectUrlsRef.current.delete(old.previewUrl);
      }
      return prev.map((f) =>
        f.id === id
          ? {
              ...f,
              file: newFile,
              previewUrl: newPreviewUrl,
              status: "pending" as const,
              progress: 0,
              presigned: undefined,
              result: undefined,
              error: undefined,
            }
          : f
      );
    });
  }, []);

  const reorderFiles = useCallback(
    (fromIndex: number, toIndex: number) => {
      setFiles((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    []
  );

  const uploadAll = useCallback(
    async (postId: string): Promise<PostImage[]> => {
      setIsUploading(true);
      setError(null);

      // Leer las pendientes del ref (evita closure stale con React 18 batch)
      const pending = filesRef.current.filter((f) => f.status === "pending");

      if (pending.length === 0) {
        setIsUploading(false);
        return [];
      }

      try {
        // ─── 1. PRESIGN ─────────────────────────────────
        const presignResult = await imageService.presign(
          pending.map((f) => ({
            name: f.file.name,
            type: f.file.type,
            size: f.file.size,
          }))
        );

        // Vincular datos presign a cada archivo
        const withPresign = pending.map((f, i) => ({
          ...f,
          presigned: presignResult.uploads[i],
        }));

        // Actualizar estado con presigned data
        const presignMap = new Map(
          withPresign.map((f) => [f.id, f.presigned])
        );
        setFiles((prev) =>
          prev.map((f) =>
            presignMap.has(f.id) ? { ...f, presigned: presignMap.get(f.id)! } : f
          )
        );

        // ─── 2. SUBIR CADA ARCHIVO A S3 ────────────────
        for (const fileItem of withPresign) {
          if (!fileItem.presigned) continue;

          // Marcar como "subiendo"
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id ? { ...f, status: "uploading" as const } : f
            )
          );

          await imageService.uploadToS3(
            fileItem.presigned.uploadUrl,
            fileItem.file,
            (progress) => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === fileItem.id ? { ...f, progress } : f
                )
              );
            }
          );

          // Marcar como "confirmando" (S3 ya tiene el archivo)
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, status: "confirming" as const, progress: 100 }
                : f
            )
          );
        }

        // ─── 3. CONFIRMAR EN BACKEND ────────────────────
        const confirmResult = await imageService.confirm(
          postId,
          withPresign.map((f) => ({
            tempKey: f.presigned!.tempKey,
            key: f.presigned!.key,
          }))
        );

        // Marcar todas como completadas
        const resultMap = new Map(
          confirmResult.images.map((img, i) => [withPresign[i]?.id, img])
        );

        setFiles((prev) =>
          prev.map((f) =>
            resultMap.has(f.id)
              ? {
                  ...f,
                  status: "done" as const,
                  progress: 100,
                  result: resultMap.get(f.id)!,
                }
              : f
          )
        );

        return confirmResult.images;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error al subir imágenes";
        setError(msg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    // Limpiar object URLs de los archivos actuales
    setFiles((prev) => {
      prev.forEach((f) => {
        URL.revokeObjectURL(f.previewUrl);
        objectUrlsRef.current.delete(f.previewUrl);
      });
      return [];
    });
    setError(null);
    setValidationErrors([]);
    setIsUploading(false);
  }, []);

  // Progreso general (promedio de todos los archivos)
  const overallProgress =
    files.length === 0
      ? 0
      : Math.round(
          files.reduce((sum, f) => sum + f.progress, 0) / files.length
        );

  return {
    files,
    addFiles,
    removeFile,
    replaceFile,
    reorderFiles,
    uploadAll,
    isUploading,
    overallProgress,
    error,
    validationErrors,
    reset,
  };
}
