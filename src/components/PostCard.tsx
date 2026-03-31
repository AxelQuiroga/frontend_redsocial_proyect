import { useState } from "react";
import type { PostWithAuthor } from "../types/post";

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
    } catch {
      setError("Error al guardar los cambios");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !window.confirm("¿Eliminar este post?")) return;

    setIsDeleting(true);
    try {
      await onDelete(post.id);
    } catch {
      setError("Error al eliminar");
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
      <div
        style={{
          border: "1px solid #e1e4e8",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "16px",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          transition: "box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        }}
      >
        {error && <p style={{ color: "#dc3545", marginBottom: "12px" }}>{error}</p>}
        <form onSubmit={handleSave}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label>Título</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting} required style={{ padding: "8px", fontSize: "16px", border: "1px solid #ced4da", borderRadius: "4px" }} />
            </div>
            <div>
              <label>Contenido</label>
              <textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)} disabled={isSubmitting} required style={{ padding: "8px", fontSize: "16px", border: "1px solid #ced4da", borderRadius: "4px" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()} style={{ padding: "8px 16px", fontSize: "16px", border: "none", borderRadius: "4px", backgroundColor: "#007bff", color: "#ffffff", cursor: "pointer" }}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={handleCancel} disabled={isSubmitting} style={{ padding: "8px 16px", fontSize: "16px", border: "none", borderRadius: "4px", backgroundColor: "#6c757d", color: "#ffffff", cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #e1e4e8",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            marginRight: "12px",
          }}
        >
          {post.author.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 style={{ margin: 0, color: "#1f2937" }}>{post.author.username}</h4>
          <small style={{ color: "#6b7280" }}>
            {new Date(post.createdAt).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </small>
        </div>
      </div>

      <h3 style={{ margin: "0 0 10px 0", color: "#111827", fontSize: "1.25rem" }}>
        {post.title}
      </h3>

      <p style={{ margin: 0, color: "#4b5563", lineHeight: "1.6" }}>
        {post.content}
      </p>

      <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
        {canEdit && (
          <button onClick={() => setIsEditing(true)} title="Editar">✏️</button>
        )}
        {canDelete && (
          <button onClick={handleDelete} disabled={isDeleting} title="Eliminar">
            {isDeleting ? "⏳" : "🗑️"}
          </button>
        )}
      </div>
    </div>
  );
}