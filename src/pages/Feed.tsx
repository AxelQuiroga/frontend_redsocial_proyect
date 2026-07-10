import { useCallback, useEffect, useState } from "react";
import { postService } from "@/services/postService";
import type { PostWithAuthor, PaginatedPosts } from "@/types/post";
import { PostCard } from "@/components/PostCard";

type FeedTab = "para-ti" | "siguiendo";

export function FeedPage() {
  const [tab, setTab] = useState<FeedTab>("para-ti");
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [meta, setMeta] = useState<PaginatedPosts["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = tab === "siguiendo"
        ? await postService.getFeed(page, limit)
        : await postService.getAll(page, limit);

      setPosts(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error("Error al cargar feed:", err);
      setError("Error al cargar el feed");
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleTabChange = (newTab: FeedTab) => {
    if (newTab === tab) return;
    setTab(newTab);
    setPage(1);
  };

  if (loading) return <p className="text-secondary">Cargando feed...</p>;
  if (error) return <p style={{ color: "var(--color-danger)" }}>{error}</p>;

  return (
    <div>
      <h2 style={{ marginBottom: "var(--space-md)" }}>Feed</h2>

      {/* Tabs */}
      <div className="feed-tabs">
        <button
          className={`feed-tab ${tab === "para-ti" ? "feed-tab--active" : ""}`}
          onClick={() => handleTabChange("para-ti")}
        >
          Para ti
        </button>
        <button
          className={`feed-tab ${tab === "siguiendo" ? "feed-tab--active" : ""}`}
          onClick={() => handleTabChange("siguiendo")}
        >
          Siguiendo
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="feed-empty">
          <p className="text-secondary">
            {tab === "siguiendo"
              ? "No hay posts de usuarios que sigues. ¡Sigue a más personas para personalizar tu feed!"
              : "No hay posts todavía."}
          </p>
        </div>
      ) : (
        <div>
          {meta?.fromFollowed !== undefined && meta.fromFollowed > 0 && (
            <p className="feed-from-followed">
              Mostrando {meta.fromFollowed} posts de usuarios que sigues
              {meta.fromFollowed < posts.length && ` y ${posts.length - meta.fromFollowed} recomendados`}
            </p>
          )}
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
          <span className="text-secondary">
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
