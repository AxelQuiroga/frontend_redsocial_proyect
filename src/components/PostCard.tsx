import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { followService } from "@/services/followService";
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
  /** Estado inicial de follow (desde batch del feed). undefined = no mostrar botón */
  isFollowing?: boolean;
  /** Callback cuando el estado de follow cambia realmente (API success) */
  onFollowChange?: (authorId: string, isFollowing: boolean) => void;
}

export function PostCard({ post, currentUserId, onEdit, onDelete, isFollowing: initialFollowing, onFollowChange }: PostCardProps) {
  // Estado local de follow — inicializado desde el prop, SIN useEffect para resync
  // Esta es la ÚNICA fuente de verdad para la UI del botón follow
  const [isFollowing, setIsFollowing] = useState(initialFollowing ?? false);
  const [followLoading, setFollowLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [images, setImages] = useState<PostImage[]>(post.images ?? []);
  const [imagesLoading, setImagesLoading] = useState(!post.images);
  const [deleteError, setDeleteError] = useState("");

  const isAuthor = currentUserId === post.author.id;
  const canShowFollow = currentUserId !== undefined && !isAuthor && initialFollowing !== undefined;

  const handleFollowToggle = useCallback(async () => {
    if (followLoading) return;
    const previous = isFollowing;

    // Optimistic update inmediato en la UI
    setIsFollowing(!previous);
    setFollowLoading(true);

    try {
      if (previous) {
        await followService.unfollow(post.author.id);
      } else {
        await followService.follow(post.author.id);
      }
      // Avisar al padre del cambio real
      onFollowChange?.(post.author.id, !previous);
    } catch (err) {
      console.error("Error al cambiar follow:", err);
      // Revertir al estado anterior
      setIsFollowing(previous);
    } finally {
      setFollowLoading(false);
    }
  }, [post.author.id, isFollowing, followLoading, onFollowChange]);

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
        <div className="post-card-author-info">
          <div className="post-card-author-row">
            <h4 style={{ margin: 0 }}>
              <Link to={`/u/${post.author.username}`} className="post-author-link">
                {post.author.username}
              </Link>
            </h4>
            {canShowFollow && (
              <button
                className={`follow-btn-inline ${isFollowing ? "follow-btn-inline--active" : ""}`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? "..." : isFollowing ? "Siguiendo" : "Seguir"}
              </button>
            )}
          </div>
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
          <button onClick={() => setIsEditing(true)} title="Editar" className="post-card-button-icon">✏️</button>
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
