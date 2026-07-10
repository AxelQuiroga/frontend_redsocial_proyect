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

  // Estado de follow centralizado: status, loading, error — por authorId
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const [followError, setFollowError] = useState<Record<string, string>>({});

  const [page, setPage] = useState(1);
  const limit = 10;

  // AbortController para cancelar requests al cambiar página/tab
  const abortRef = useRef<AbortController | null>(null);

  // Ref para trackear toggles en vuelo y evitar race conditions con batch
  const togglingRef = useRef<Set<string>>(new Set());
  // Refs para leer estado actual sin depender del closure en useCallback
  const followStatusRef = useRef(followStatus);
  followStatusRef.current = followStatus;
  const followLoadingRef = useRef(followLoading);
  followLoadingRef.current = followLoading;

  const fetchFollowStatus = useCallback(async (authorIds: string[]) => {
    const uniqueIds = [...new Set(authorIds)];
    const targetIds = currentUser?.id
      ? uniqueIds.filter(id => id !== currentUser.id)
      : uniqueIds;

    if (targetIds.length === 0) return;

    try {
      const status = await followService.getStatusBatch(targetIds);
      setFollowStatus(prev => ({ ...prev, ...status }));
    } catch {
      // Silencioso
    }
  }, [currentUser?.id]);

  const fetchFeed = useCallback(async () => {
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

  const handleFollowToggle = useCallback(async (authorId: string) => {
    if (!currentUser?.id) return;
    // Guard contra doble click usando ref (no espera re-render)
    if (togglingRef.current.has(authorId)) return;

    const current = followStatusRef.current[authorId] ?? false;
    const newStatus = !current;

    togglingRef.current.add(authorId);

    // Optimistic update inmediato
    setFollowStatus(prev => ({ ...prev, [authorId]: newStatus }));
    setFollowLoading(prev => ({ ...prev, [authorId]: true }));
    setFollowError(prev => {
      const next = { ...prev };
      delete next[authorId];
      return next;
    });

    try {
      if (newStatus) {
        await followService.follow(authorId);
      } else {
        await followService.unfollow(authorId);
      }
      // Re-aplicar después de API exitosa (en caso de que el batch haya pisado durante el await)
      setFollowStatus(prev => ({ ...prev, [authorId]: newStatus }));
    } catch (err) {
      console.error("Error al cambiar follow:", err);
      // Revertir al estado anterior
      setFollowStatus(prev => ({ ...prev, [authorId]: current }));
      setFollowError(prev => ({ ...prev, [authorId]: "Error al cambiar estado. Intentalo de nuevo." }));
    } finally {
      setFollowLoading(prev => ({ ...prev, [authorId]: false }));
      togglingRef.current.delete(authorId);
    }
  }, [currentUser?.id]);

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
              isFollowing={followStatus[post.author.id]}
              followLoading={followLoading[post.author.id]}
              followError={followError[post.author.id]}
              onToggleFollow={handleFollowToggle}
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
