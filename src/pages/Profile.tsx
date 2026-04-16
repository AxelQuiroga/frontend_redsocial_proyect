import { useEffect, useState } from "react";
import { postService } from "../services/postService";
import { useAuth } from "../hooks/useAuth";
import type { PostWithAuthor } from "../types/post";
import { PostCard } from "../components/PostCard";
import { userService } from "../services/userService";


export function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(user?.coverUrl ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [website, setWebsite] = useState(user?.website ?? "");

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    setBio(user.bio ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
    setCoverUrl(user.coverUrl ?? "");
    setLocation(user.location ?? "");
    setWebsite(user.website ?? "");
  }, [user]);

  const resetProfileForm = () => {
    setDisplayName(user?.displayName ?? "");
    setBio(user?.bio ?? "");
    setAvatarUrl(user?.avatarUrl ?? "");
    setCoverUrl(user?.coverUrl ?? "");
    setLocation(user?.location ?? "");
    setWebsite(user?.website ?? "");
    setProfileError("");
    setProfileSuccess("");
  };

  const fetchMyPosts = async () => {
    try {
      setPostsLoading(true);
      setPostsError("");
      const data = await postService.getMyPosts();
      setPosts(data);
    } catch (err) {
      console.error("Error al cargar posts:", err);
      setPostsError("Error al cargar mis posts");
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleUpdatePost = async (id: string, data: { title: string; content: string }) => {
    try {
      await postService.update(id, data);
      await fetchMyPosts();
    } catch (err) {
      console.error("Error al actualizar post:", err);
      setPostsError("Error al actualizar el post");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await postService.delete(id);
      await fetchMyPosts();
    } catch (err) {
      console.error("Error al eliminar post:", err);
      setPostsError("Error al eliminar el post");
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setCreateError("");

    try {
      await postService.create({ title, content });
      setTitle("");
      setContent("");
      await fetchMyPosts();
    } catch (err) {
      console.error("Error al crear post:", err);
      setCreateError("Error al crear el post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");

    // Solo enviar campos que el usuario modificó
    const payload: Record<string, string | null> = {};
    if (displayName.trim() !== (user?.displayName ?? "")) {
      payload.displayName = displayName.trim() || null;
    }
    if (bio.trim() !== (user?.bio ?? "")) {
      payload.bio = bio.trim() || null;
    }
    if (avatarUrl.trim() !== (user?.avatarUrl ?? "")) {
      payload.avatarUrl = avatarUrl.trim() || null;
    }
    if (coverUrl.trim() !== (user?.coverUrl ?? "")) {
      payload.coverUrl = coverUrl.trim() || null;
    }
    if (location.trim() !== (user?.location ?? "")) {
      payload.location = location.trim() || null;
    }
    if (website.trim() !== (user?.website ?? "")) {
      payload.website = website.trim() || null;
    }

    const hasAnyField = Object.keys(payload).length > 0;
    if (!hasAnyField) {
      setProfileError("Modifica al menos un campo para actualizar.");
      setIsProfileSaving(false);
      return;
    }

    try {
      const updated = await userService.updateProfile(payload);
      setDisplayName(updated.displayName ?? "");
      setBio(updated.bio ?? "");
      setAvatarUrl(updated.avatarUrl ?? "");
      setCoverUrl(updated.coverUrl ?? "");
      setLocation(updated.location ?? "");
      setWebsite(updated.website ?? "");
      await refreshUser();
      setProfileSuccess("Perfil actualizado.");
      setIsEditingProfile(false); // ← Cerrar formulario al guardar
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setProfileError("Error al actualizar el perfil.");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    resetProfileForm();
    setIsEditingProfile(false);
  };

  // Helper para obtener href de website
  const websiteHref = website && website.trim()
    ? website.startsWith("http") ? website : `https://${website}`
    : undefined;

  return (
    <div className="section">
      {/* ─── PERFIL (VISTA O EDICIÓN) ─── */}
      <div className="card">
        {/* Header con cover image siempre visible */}
        <div 
          className="profile-cover-custom"
          style={{
            background: coverUrl 
              ? `url(${coverUrl})` 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          }}
        />
        
        {/* Avatar y stats siempre visibles */}
        <div className="profile-avatar-container">
          <div className="profile-avatar-custom">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
              />
            ) : (
              <span>{displayName?.charAt(0).toUpperCase() || "?"}</span>
            )}
          </div>
          <div style={{ marginLeft: "20px", flex: 1, marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "24px" }}>{displayName || "Usuario"}</h2>
            <p className="username" style={{ margin: "4px 0 0" }}>@{user?.username || "usuario"}</p>
            {bio && <p className="bio" style={{ margin: "8px 0 0" }}>{bio}</p>}
            <div className="profile-view-meta" style={{ marginTop: "12px" }}>
              {location && <span>📍 {location}</span>}
              {websiteHref && (
                <a href={websiteHref} target="_blank" rel="noreferrer">
                  🔗 {website}
                </a>
              )}
            </div>
            {!isEditingProfile && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  resetProfileForm();
                  setIsEditingProfile(true);
                }}
                title="Editar perfil"
              >
                ✏️ Editar
              </button>
            )}
          </div>
        </div>

        {/* Stats Section siempre visible */}
        <div className="profile-stats">
          <div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{posts.length}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Posts</div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("es-ES", { month: "short", year: "numeric" }) : "-"}
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>Se unió</div>
          </div>
        </div>

        {/* Formulario de edición (aparece debajo cuando isEditingProfile) */}
        {isEditingProfile && (
          <div className="profile-edit-section">
            <div className="profile-header-row" style={{ marginBottom: "var(--space-md)" }}>
              <h3 className="section-title">Editar perfil</h3>
            </div>
            
            {profileError && (
              <p style={{ color: "var(--color-danger)", marginBottom: "var(--space-sm)" }}>
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p style={{ color: "var(--color-success)", marginBottom: "var(--space-sm)" }}>
                {profileSuccess}
              </p>
            )}
            
            <form className="profile-form" onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="displayName">Nombre visible</label>
                <input
                  id="displayName"
                  className="input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Cómo quieres que te llamen"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Ubicación</label>
                <input
                  id="location"
                  className="input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ciudad, País"
                />
              </div>

              <div className="form-group full">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  className="input"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="avatarUrl">URL del avatar</label>
                <input
                  id="avatarUrl"
                  className="input"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Sitio web</label>
                <input
                  id="website"
                  className="input"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://tusitio.com"
                />
              </div>

              <div className="profile-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isProfileSaving}
                >
                  {isProfileSaving ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ─── CREAR POST ─── */}
      <div className="card">
        <h3 style={{ marginBottom: "var(--space-md)" }}>Crear Post</h3>
        {createError && <p style={{ color: "var(--color-danger)" }}>{createError}</p>}
        <form onSubmit={handleCreatePost}>
          <div className="form-group">
            <label htmlFor="postTitle">Título</label>
            <input
              id="postTitle"
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="postContent">Contenido</label>
            <textarea
              id="postContent"
              className="input"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </div>

      {/* ─── MIS POSTS ─── */}
      <div>
        <h2 className="section-title">Mis Posts</h2>

        {postsLoading && <p className="text-secondary">Cargando posts...</p>}
        {postsError && <p style={{ color: "var(--color-danger)" }}>{postsError}</p>}
        {!postsLoading && !postsError && posts.length === 0 ? (
          <p className="text-secondary">No tienes posts aún. ¡Crea tu primer post!</p>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onEdit={handleUpdatePost}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}