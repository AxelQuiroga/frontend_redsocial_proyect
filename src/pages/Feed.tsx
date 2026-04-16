import { useCallback, useEffect, useState } from "react";
import { postService } from "../services/postService";
import type { PostWithAuthor, PaginatedPosts } from "../types/post";
import { PostCard } from "../components/PostCard";

export function FeedPage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [meta, setMeta] = useState<PaginatedPosts["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      const res = await postService.getAll(page, limit);
      setPosts(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error("Error al cargar feed:", err);
      setError("Error al cargar el feed");
    } finally {
      setLoading(false);
    }
  },[page]);

  useEffect(() => {
  fetchFeed();
}, [fetchFeed]);

  if (loading) return <p className="text-secondary">Cargando feed...</p>;
  if (error) return <p style={{ color: "var(--color-danger)" }}>{error}</p>;

  return (
    <div>
      <h2 style={{ marginBottom: "var(--space-md)" }}>Feed público</h2>

      {posts.length === 0 ? (
        <p className="text-secondary">No hay posts todavía.</p>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {meta && (
        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <button
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span>
            Página {meta.page} de {meta.totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
