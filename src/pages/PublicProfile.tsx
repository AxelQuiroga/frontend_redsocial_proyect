import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { userService } from "../services/userService";
import { postService } from "../services/postService";
import { PostCard } from "../components/PostCard";
import type { UserPublicProfile } from "../types/profile";
import type { PaginatedPosts } from "../types/post";

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
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [posts, setPosts] = useState<PaginatedPosts | null>(null);
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
      
      // Actualizar estado con los posts nuevos
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
        
        // Fetch profile y posts en paralelo con AbortController
        const [profileData, postsData] = await Promise.all([
          userService.getUserProfile(username),
          postService.getPostsByUser(username, 1, 10)
        ]);
        
        // Solo actualizar si no fue cancelado
        if (!controller.signal.aborted) {
          setProfile(profileData);
          setPosts(postsData);
          setCurrentPage(1);
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
    return () => controller.abort(); // Cleanup para prevenir race conditions
  }, [username]);

  if (loading) return <p className="text-secondary">Cargando perfil...</p>;
  if (error) return <p style={{ color: "var(--color-danger)" }}>{error}</p>;
  if (!profile) return <p className="text-secondary">Perfil no encontrado</p>;

  // Optimización: useMemo para evitar recálculos innecesarios
  const websiteHref = useMemo(() => {
    return profile.website ? sanitizeUrl(profile.website) : undefined;
  }, [profile.website]);

  const sanitizedCoverUrl = useMemo(() => {
    return profile.coverUrl ? sanitizeUrl(profile.coverUrl) : undefined;
  }, [profile.coverUrl]);

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

          <div>
            <h2 className="section-title">{profile.displayName || profile.username || "Usuario"}</h2>
            <p className="text-secondary">@{profile.username || "usuario"}</p>
          </div>
        </div>

        <div className="profile-meta">
          {profile.bio && <p>{profile.bio}</p>}

          <div className="profile-badges">
            {profile.location && <span>📍 {profile.location}</span>}
            {websiteHref && (
              <a href={websiteHref} target="_blank" rel="noreferrer">
                {profile.website}
              </a>
            )}
          </div>
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
                currentUserId={null} // No hay usuario logueado en perfil público
              />
            ))}
          </div>
          
          {posts.meta.currentPage < posts.meta.totalPages && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button 
                className="button button-secondary"
                onClick={loadMorePosts}
                disabled={loadingMore}
              >
                {loadingMore ? "Cargando..." : "Cargar más posts"}
              </button>
            </div>
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
