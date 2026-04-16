import { useState, useEffect } from "react";
import { commentService } from "../services/commentService";
import type { Comment } from "../types/comment";

interface CommentListProps {
  postId: string;
  currentUserId?: string;
  postAuthorId?: string;
}

export function CommentList({ postId, currentUserId, postAuthorId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const res = await commentService.getByPost(postId, page, 10);
      setComments(res.data);
      setMeta(res.meta);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const newComment = await commentService.create(postId, { content: content.trim() });
      setComments([newComment, ...comments]);
      setContent("");
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    
    try {
      await commentService.delete(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, page]);

  if (isLoading && comments.length === 0) {
    return <p style={{ color: "#6b7280" }}>Cargando comentarios...</p>;
  }

  return (
    <div style={{ marginTop: "16px" }}>
      <h4 style={{ marginBottom: "8px" }}>Comentarios ({meta?.total || 0})</h4>

      <form onSubmit={handleSubmit} style={{ marginBottom: "16px" }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un comentario..."
          rows={2}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #e1e4e8",
            borderRadius: "4px",
            fontSize: "14px",
            resize: "vertical"
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          style={{
            marginTop: "8px",
            padding: "6px 12px",
            fontSize: "14px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: isSubmitting || !content.trim() ? "#9ca3af" : "#007bff",
            color: "#ffffff",
            cursor: isSubmitting || !content.trim() ? "not-allowed" : "pointer"
          }}
        >
          {isSubmitting ? "Enviando..." : "Comentar"}
        </button>
      </form>

      {comments.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No hay comentarios aún.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e1e4e8"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  @{comment.author.username}
                </span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  {new Date(comment.createdAt).toLocaleDateString("es-ES")}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>{comment.content}</p>
              {(currentUserId === comment.authorId || currentUserId === postAuthorId) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  style={{
                    marginTop: "8px",
                    padding: "4px 8px",
                    fontSize: "12px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: "4px 8px",
              fontSize: "14px",
              border: "1px solid #e1e4e8",
              borderRadius: "4px",
              backgroundColor: "#ffffff",
              cursor: page <= 1 ? "not-allowed" : "pointer"
            }}
          >
            Anterior
          </button>
          <span style={{ fontSize: "14px" }}>
            Página {meta.page} de {meta.totalPages}
          </span>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            style={{
              padding: "4px 8px",
              fontSize: "14px",
              border: "1px solid #e1e4e8",
              borderRadius: "4px",
              backgroundColor: "#ffffff",
              cursor: page >= meta.totalPages ? "not-allowed" : "pointer"
            }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
