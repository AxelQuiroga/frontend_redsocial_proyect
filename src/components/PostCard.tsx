import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { PostWithAuthor } from "@/types/post";
import type { PostImage } from "@/types/image";
import { LikeButton } from "@/components/LikeButton";
import { CommentList } from "@/components/CommentList";
import { PostEditForm } from "@/components/PostEditForm";
import { PostImageGallery } from "@/components/posts/PostImageGallery";
import { imageService } from "@/services/imageService";

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
  const [showComments, setShowComments] = useState(false);
  const [images, setImages] = useState<PostImage[]>(post.images ?? []);
  const [imagesLoading, setImagesLoading] = useState(!post.images);
  const [deleteError, setDeleteError] = useState("");

  // Cargar imágenes si no vienen en el post
  useEffect(() => {
    if (post.images) {
      setImages(post.images);
      setImagesLoading(false);
      return;
    }

    let cancelled = false;
    setImagesLoading(true);

    imageService
      .getPostImages(post.id)
      .then((data) => {
        if (!cancelled) {
          setImages(data);
          setImagesLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setImagesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [post.id, post.images]);

  const isAuthor = currentUserId === post.author.id;
  const canEdit = isAuthor && onEdit;
  const canDelete = isAuthor && onDelete;

  const handleSave = async (title: string, content: string) => {
    if (!onEdit) return;
    await onEdit(post.id, { title, content });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!onDelete || !window.confirm("¿Eliminar este post?")) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      await onDelete(post.id);
    } catch (err) {
      console.error("Error al eliminar post:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setDeleteError(`Error al eliminar: ${errorMessage}`);
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <PostEditForm
        initialTitle={post.title}
        initialContent={post.content}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="post-card">
      {deleteError && <p className="post-card-error">{deleteError}</p>}

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

      {/* Imágenes del post */}
      {imagesLoading && (
        <div className="post-card-images-loading">Cargando imágenes...</div>
      )}
      {!imagesLoading && images.length > 0 && (
        <PostImageGallery images={images} />
      )}

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
