import { useState } from "react";

interface PostEditFormProps {
  initialTitle: string;
  initialContent: string;
  onSave: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
}

export function PostEditForm({
  initialTitle,
  initialContent,
  onSave,
  onCancel,
}: PostEditFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      await onSave(title.trim(), content.trim());
    } catch (err) {
      console.error("Error al guardar post:", err);
      setError("Error al guardar los cambios");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle(initialTitle);
    setContent(initialContent);
    setError("");
    onCancel();
  };

  return (
    <div className="post-card-editing">
      {error && <p className="post-card-error">{error}</p>}
      <form onSubmit={handleSubmit} className="post-card-form">
        <div>
          <label>Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
            className="post-card-input"
          />
        </div>
        <div>
          <label>Contenido</label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            required
            className="post-card-input"
          />
        </div>
        <div className="post-card-form-actions">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="post-card-button-primary"
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="post-card-button-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
