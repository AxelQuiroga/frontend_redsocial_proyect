import { useState, useEffect } from "react";
import type { PostWithAuthor } from "../types/post";
import { Link } from "react-router-dom";
import { LikeButton } from "./LikeButton";
import { CommentList } from "./CommentList";

// Utilidad para sanitizar contenido y prevenir XSS
const sanitizeContent = (content: string): string => {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

interface PostCardProps {
  post: PostWithAuthor;
  currentUserId?: string;
  onEdit?: (id: string, data: { title: string; content: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function PostCard({ post, currentUserId, onEdit, onDelete }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showComments, setShowComments] = useState(false);

  // Sincronizar estado local con props externas
  useEffect(() => {
    setTitle(post.title);
    setContent(post.content);
  }, [post.title, post.content]);

  const isAuthor = currentUserId === post.author.id;
  const canEdit = isAuthor && onEdit;
  const canDelete = isAuthor && onDelete;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !onEdit) return;

    setIsSubmitting(true);
    setError("");

    try {
      await onEdit(post.id, { title: title.trim(), content: content.trim() });
      setIsEditing(false);
    } catch (err) {
      console.error("Error al guardar post:", err);
      setError("Error al guardar los cambios");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !window.confirm("¿Eliminar este post?")) return;

    setIsDeleting(true);
    setError("");
    try {
      await onDelete(post.id);
    } catch (err) {
      console.error("Error al eliminar post:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(`Error al eliminar: ${errorMessage}`);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setTitle(post.title);
    setContent(post.content);
    setError("");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="post-card-editing">
        {error && <p className="post-card-error">{error}</p>}
        <form onSubmit={handleSave} className="post-card-form">
          <div>
            <label>Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting} required className="post-card-input" />
          </div>
          <div>
            <label>Contenido</label>
            <textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)} disabled={isSubmitting} required className="post-card-input" />
          </div>
          <div className="post-card-form-actions">
            <button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()} className="post-card-button-primary">
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={handleCancel} disabled={isSubmitting} className="post-card-button-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="post-card">
      <div className="post-card-header">
        <div className="avatar post-card-avatar">
          {post.author.username?.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <h4 style={{ margin: 0 }}>
            <Link to={`/u/${post.author.username}`} className="post-author-link">
              {post.author.username}
            </Link>
          </h4>
          <small style={{ color: "var(--color-text-secondary)" }}>
            {new Date(post.createdAt).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </small>
        </div>
      </div>

      <h3 className="post-card-title">
        {sanitizeContent(post.title)}
      </h3>

      <p className="post-card-content">
        {sanitizeContent(post.content)}
      </p>

      <div className="post-card-actions">
        <LikeButton postId={post.id} />
        <button
          onClick={() => setShowComments(!showComments)}
          className="post-card-button"
        >
          💬 {showComments ? "Ocultar comentarios" : "Ver comentarios"}
        </button>
        {canEdit && (
          <button onClick={() => setIsEditing(true)} title="Editar" className="post-card-button-icon post-card-button-edit">✏️</button>
        )}
        {canDelete && (
          <button onClick={handleDelete} disabled={isDeleting} title="Eliminar" className="post-card-button-icon">
            {isDeleting ? "⏳" : "🗑️"}
          </button>
        )}
      </div>

      {showComments && <CommentList postId={post.id} currentUserId={currentUserId} postAuthorId={post.author.id} />}
    </div>
  );
}
