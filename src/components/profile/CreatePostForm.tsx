import { useState, useCallback } from "react";
import { postService } from "@/services/postService";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageDropzone } from "@/components/posts/ImageDropzone";
import { ImageEditorModal } from "@/components/posts/ImageEditorModal";

interface CreatePostFormProps {
  onPostCreated: () => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  const {
    files: imageFiles,
    addFiles: addImageFiles,
    removeFile: removeImageFile,
    replaceFile: replaceImageFile,
    reorderFiles: reorderImageFiles,
    uploadAll: uploadImages,
    overallProgress: imageUploadProgress,
    validationErrors: imageValidationErrors,
    reset: resetImageUpload,
  } = useImageUpload();

  // Estado del editor de imágenes
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const editingFile = editingFileId
    ? imageFiles.find((f) => f.id === editingFileId)?.file ?? null
    : null;

  const handleEditFile = useCallback((id: string) => {
    setEditingFileId(id);
  }, []);

  const handleEditorApply = useCallback(
    (editedFile: File) => {
      if (editingFileId) {
        replaceImageFile(editingFileId, editedFile);
      }
      setEditingFileId(null);
    },
    [editingFileId, replaceImageFile]
  );

  const handleEditorCancel = useCallback(() => {
    setEditingFileId(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setCreateError("");

    try {
      const newPost = await postService.create({ title, content });

      if (imageFiles.length > 0) {
        await uploadImages(newPost.id);
      }

      setTitle("");
      setContent("");
      resetImageUpload();
      onPostCreated();
    } catch (err) {
      console.error("Error al crear post:", err);
      const msg =
        err instanceof Error ? err.message : "Error al crear el post";
      setCreateError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: "var(--space-md)" }}>Crear Post</h3>
      {createError && (
        <p style={{ color: "var(--color-danger)" }}>{createError}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="postTitle">Título</label>
          <input
            id="postTitle"
            type="text"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="postContent">Contenido</label>
          <textarea
            id="postContent"
            className="input"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Dropzone de imágenes */}
        <div className="form-group">
          <label>Imágenes (opcional, máximo 5)</label>
          <ImageDropzone
            files={imageFiles}
            onAddFiles={addImageFiles}
            onRemoveFile={removeImageFile}
            onReorderFiles={reorderImageFiles}
            onEditFile={handleEditFile}
            isUploading={isSubmitting}
            validationErrors={imageValidationErrors}
          />
        </div>

        {/* Editor modal */}
        {editingFile && (
          <ImageEditorModal
            file={editingFile}
            onApply={handleEditorApply}
            onCancel={handleEditorCancel}
          />
        )}

        {/* Progreso de subida */}
        {isSubmitting && imageFiles.length > 0 && (
          <div className="create-post-upload-progress">
            <div className="create-post-upload-progress-bar">
              <div
                className="create-post-upload-progress-fill"
                style={{ width: `${imageUploadProgress}%` }}
              />
            </div>
            <span className="create-post-upload-progress-text">
              Subiendo imágenes... {imageUploadProgress}%
            </span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !title.trim() || !content.trim()}
        >
          {isSubmitting
            ? imageFiles.length > 0
              ? `Subiendo imágenes (${imageUploadProgress}%)...`
              : "Publicando..."
            : "Publicar"}
        </button>
      </form>
    </div>
  );
}
