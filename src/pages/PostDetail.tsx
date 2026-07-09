import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PostCard } from "@/components/PostCard";
import { postService } from "@/services/postService";
import type { PostWithAuthor } from "@/types/post";

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!postId) return;

    let cancelled = false;
    setIsLoading(true);
    setError("");

    postService
      .getById(postId)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Error al cargar el post";
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (isLoading) {
    return <div className="page-loading">Cargando post...</div>;
  }

  if (error) {
    return (
      <div className="page-error">
        <p>{error}</p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Volver al inicio
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="page-error">
        <p>Post no encontrado</p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <button
        onClick={() => navigate(-1)}
        className="back-button"
        aria-label="Volver"
      >
        ← Volver
      </button>
      <PostCard post={post} />
    </div>
  );
}
