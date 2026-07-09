import { useRef, useState, useCallback } from "react";
import type { ImageUploadItem } from "@/types/image";

interface ImageDropzoneProps {
  files: ImageUploadItem[];
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
  onReorderFiles: (fromIndex: number, toIndex: number) => void;
  onEditFile?: (id: string) => void;
  isUploading: boolean;
  validationErrors: string[];
  maxFiles?: number;
}

export function ImageDropzone({
  files,
  onAddFiles,
  onRemoveFile,
  onReorderFiles,
  onEditFile,
  isUploading,
  validationErrors,
  maxFiles = 5,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleClick = useCallback(() => {
    if (!isUploading) inputRef.current?.click();
  }, [isUploading]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onAddFiles(e.target.files);
        e.target.value = ""; // permitir re-seleccionar el mismo archivo
      }
    },
    [onAddFiles]
  );

  // ─── Drag & Drop events ───────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (!isUploading && e.dataTransfer.files.length > 0) {
        onAddFiles(e.dataTransfer.files);
      }
    },
    [isUploading, onAddFiles]
  );

  // ─── Reorder Drag & Drop ─────────────────────────────
  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOverItem = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === index) return;
      onReorderFiles(dragIndex, index);
      setDragIndex(index);
    },
    [dragIndex, onReorderFiles]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  const remaining = maxFiles - files.length;

  return (
    <div className="image-dropzone-wrapper">
      {/* ─── Dropzone ─── */}
      <div
        className={`image-dropzone ${isDragOver ? "image-dropzone--dragover" : ""} ${isUploading ? "image-dropzone--disabled" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        aria-label="Agregar imágenes"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={isUploading}
        />

        <div className="image-dropzone-content">
          <span className="image-dropzone-icon">📷</span>
          <p className="image-dropzone-text">
            {isDragOver
              ? "Soltá las imágenes aquí"
              : "Arrastrá imágenes o hacé click para seleccionar"}
          </p>
          <span className="image-dropzone-hint">
            JPEG, PNG, WebP o GIF — Máximo {maxFiles} imágenes — 5 MB cada una
          </span>
          {remaining > 0 && !isUploading && (
            <span className="image-dropzone-remaining">
              {remaining} de {maxFiles} disponibles
            </span>
          )}
        </div>
      </div>

      {/* ─── Errores de validación ─── */}
      {validationErrors.length > 0 && (
        <div className="image-dropzone-errors">
          {validationErrors.map((err, i) => (
            <p key={i} className="image-dropzone-error">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* ─── Previews ─── */}
      {files.length > 0 && (
        <div className="image-dropzone-previews">
          {files.map((item, index) => (
            <div
              key={item.id}
              className={`image-preview ${item.status === "done" ? "image-preview--done" : ""} ${item.status === "error" ? "image-preview--error" : ""} ${dragIndex === index ? "image-preview--dragging" : ""}`}
              draggable={!isUploading}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Imagen */}
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="image-preview-img"
              />

              {/* Botón eliminar */}
              {!isUploading && (
                <button
                  type="button"
                  className="image-preview-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(item.id);
                  }}
                  aria-label="Eliminar imagen"
                >
                  ✕
                </button>
              )}

              {/* Indicador de arrastre */}
              {!isUploading && (
                <span className="image-preview-drag" title="Arrastrar para reordenar">
                  ⠿
                </span>
              )}

              {/* Botón editar (solo en pending) */}
              {!isUploading && onEditFile && item.status === "pending" && (
                <button
                  type="button"
                  className="image-preview-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditFile(item.id);
                  }}
                  aria-label="Editar imagen"
                  title="Editar imagen"
                >
                  ✎
                </button>
              )}

              {/* Barra de progreso */}
              {item.status === "uploading" && (
                <div className="image-preview-progress">
                  <div
                    className="image-preview-progress-bar"
                    style={{ width: `${item.progress}%` }}
                  />
                  <span className="image-preview-progress-text">
                    {item.progress}%
                  </span>
                </div>
              )}

              {/* Estado "confirmando" */}
              {item.status === "confirming" && (
                <div className="image-preview-status">Procesando...</div>
              )}

              {/* Check de completado */}
              {item.status === "done" && (
                <div className="image-preview-check">✓</div>
              )}

              {/* Error */}
              {item.status === "error" && (
                <div className="image-preview-error-msg">
                  {item.error || "Error"}
                </div>
              )}

              {/* Nombre del archivo */}
              <div className="image-preview-name">
                {item.file.name.length > 20
                  ? item.file.name.slice(0, 17) + "..."
                  : item.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
