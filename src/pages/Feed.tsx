import { useCallback, useEffect, useRef, useState } from "react";
import { postService } from "@/services/postService";
import { followService } from "@/services/followService";
import { useAuth } from "@/hooks/useAuth";
import type { PostWithAuthor, PaginatedPosts } from "@/types/post";
import { PostCard } from "@/components/PostCard";

type FeedTab = "para-ti" | "siguiendo";

export function FeedPage() {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState<FeedTab>("para-ti");
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [meta, setMeta] = useState<PaginatedPosts["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followStatusMap, setFollowStatusMap] = useState<Record<string, boolean>>({});

  const [page, setPage] = useState(1);
  const limit = 10;

  // AbortController para cancelar requests al cambiar página/tab
  const abortRef = useRef<AbortController | null>(null);

  const fetchFollowStatus = useCallback(async (authorIds: string[]) => {
    const uniqueIds = [...new Set(authorIds)];
    // Solo los que NO sean el usuario actual
    const targetIds = currentUser?.id
      ? uniqueIds.filter(id => id !== currentUser.id)
      : uniqueIds;

    if (targetIds.length === 0) {
      setFollowStatusMap({});
      return;
    }

    try {
      const status = await followService.getStatusBatch(targetIds);
      setFollowStatusMap(status);
    } catch {
      // Silencioso — el PostCard se muestra sin botón si no hay status
      setFollowStatusMap({});
    }
  }, [currentUser?.id]);

  const fetchFeed = useCallback(async () => {
    // Cancelar request anterior si existe
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError("");

      const res = tab === "siguiendo"
        ? await postService.getFeed(page, limit)
        : await postService.getAll(page, limit);

      if (controller.signal.aborted) return;

      setPosts(res.data);
      setMeta(res.meta);

      // Batch follow status para los autores de los posts
      const authorIds = res.data.map(p => p.author.id);
      await fetchFollowStatus(authorIds);
    } catch (err) {
      if ((err as any)?.name === "CanceledError") return;
      console.error("Error al cargar feed:", err);
      setError("Error al cargar el feed");
    } finally {
      setLoading(false);
    }
  }, [page, tab, fetchFollowStatus]);

  useEffect(() => {
    fetchFeed();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchFeed]);

  const handleTabChange = (newTab: FeedTab) => {
    if (newTab === tab) return;
    setTab(newTab);
    setPage(1);
  };

  const handleFollowChange = useCallback((authorId: string, isFollowing: boolean) => {
    setFollowStatusMap(prev => ({ ...prev, [authorId]: isFollowing }));
  }, []);

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
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              isFollowing={followStatusMap[post.author.id]}
              onFollowChange={handleFollowChange}
            />
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
