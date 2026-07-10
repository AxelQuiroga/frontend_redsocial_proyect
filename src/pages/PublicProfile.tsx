import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MapPin } from "lucide-react";
import { userService } from "@/services/userService";
import { postService } from "@/services/postService";
import { followService } from "@/services/followService";
import { PostCard } from "@/components/PostCard";
import { FollowButton } from "@/components/FollowButton";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import type { UserPublicProfile } from "@/types/profile";
import type { PaginatedPosts } from "@/types/post";
import type { FollowCounts } from "@/services/followService";

// Utilidad para sanitizar URLs y prevenir XSS
const sanitizeUrl = (url: string): string => {
  if (!url || !url.trim()) return '#';
  try {
    const trimmed = url.trim();
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    return parsed.toString();
  } catch {
    return '#';
  }
};

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [posts, setPosts] = useState<PaginatedPosts | null>(null);
  const [followCounts, setFollowCounts] = useState<FollowCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Función para cargar más posts con paginación
  const loadMorePosts = useCallback(async () => {
    if (!username || !posts || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const morePostsData = await postService.getPostsByUser(username, nextPage, 10);

      setPosts(prev => prev ? {
        data: [...prev.data, ...morePostsData.data],
        meta: morePostsData.meta
      } : morePostsData);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Error al cargar más posts:", err);
      setError("Error al cargar más posts");
    } finally {
      setLoadingMore(false);
    }
  }, [username, posts, currentPage, loadingMore]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        if (!username) return;
        setLoading(true);
        setError("");

        // 1. Fetch profile primero (necesitamos el ID del usuario)
        const profileData = await userService.getUserProfile(username);

        if (controller.signal.aborted) return;
        setProfile(profileData);

        // 2. Fetch posts + follow data en paralelo
        const [postsData, countsData] = await Promise.all([
          postService.getPostsByUser(username, 1, 10),
          followService.getCounts(profileData.id).catch(() => null)
        ]);

        if (!controller.signal.aborted) {
          if (postsData) {
            setPosts(postsData);
            setCurrentPage(1);
          }
          if (countsData) setFollowCounts(countsData);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error al cargar datos:", err);
          const errorMessage = err instanceof Error ? err.message : "Error desconocido";
          setError(`No se pudo cargar el perfil: ${errorMessage}`);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [username]);

  // Memorizar si es el propio perfil
  const isOwnProfile = useMemo(() => {
    return currentUser?.id === profile?.id;
  }, [currentUser?.id, profile?.id]);

  // Optimización: useMemo para evitar recálculos innecesarios
  const websiteHref = useMemo(() => {
    return profile?.website ? sanitizeUrl(profile.website) : undefined;
  }, [profile?.website]);

  const sanitizedCoverUrl = useMemo(() => {
    return profile?.coverUrl ? sanitizeUrl(profile.coverUrl) : undefined;
  }, [profile?.coverUrl]);

  if (loading) {
    return (
      <div className="section">
        <Skeleton variant="profile-header" />
        <Skeleton variant="post-card" count={3} />
      </div>
    );
  }
  if (error) return <p style={{ color: "var(--color-danger)" }}>{error}</p>;
  if (!profile) return <p className="text-secondary">Perfil no encontrado</p>;

  return (
    <div className="section">
      <div className="card profile-card">
        <div
          className="profile-cover"
          style={{
            backgroundImage: sanitizedCoverUrl ? `url(${sanitizedCoverUrl})` : undefined
          }}
        />

        <div className="profile-header">
          {profile.avatarUrl ? (
            <img
              className="profile-avatar"
              src={sanitizeUrl(profile.avatarUrl)}
              alt={`Avatar de ${profile.displayName || profile.username}`}
            />
          ) : (
            <div className="avatar avatar-lg profile-avatar">
              {(profile.displayName || profile.username || "?")[0]?.toUpperCase()}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div className="profile-header-row">
              <div>
                <h2 className="section-title">{profile.displayName || profile.username || "Usuario"}</h2>
                <p className="text-secondary">@{profile.username || "usuario"}</p>
              </div>

              {!isOwnProfile && profile.id && (
                <FollowButton userId={profile.id} />
              )}
            </div>
          </div>
        </div>

        <div className="profile-meta">
          {profile.bio && <p>{profile.bio}</p>}

          <div className="profile-badges">
            {profile.location && <span><MapPin size={16} /> {profile.location}</span>}
            {websiteHref && (
              <a href={websiteHref} target="_blank" rel="noreferrer">
                {profile.website}
              </a>
            )}
          </div>

          {/* Follow counts */}
          {followCounts && (
            <div className="profile-stats">
              <span><strong>{followCounts.followersCount}</strong> seguidores</span>
              <span><strong>{followCounts.followingCount}</strong> seguidos</span>
            </div>
          )}
        </div>
      </div>

      {/* Posts de este usuario */}
      {posts && posts.data.length > 0 && (
        <div className="section">
          <h3 className="section-title">Posts de @{profile.username}</h3>
          <div className="posts-list">
            {posts.data.map((post) => (
              <PostCard
                key={post.id}
                post={post}
              />
            ))}
          </div>

          {posts.meta.page < posts.meta.totalPages && (
            <button
              className="load-more-pill"
              onClick={loadMorePosts}
              disabled={loadingMore}
            >
              {loadingMore && <Spinner size={16} />}
              {loadingMore ? "Cargando..." : "Cargar más posts"}
            </button>
          )}
        </div>
      )}

      {posts && posts.data.length === 0 && (
        <div className="section">
          <p className="text-secondary">
            @{profile.username} aún no ha publicado nada.
          </p>
        </div>
      )}
    </div>
  );
}
