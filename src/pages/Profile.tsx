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
    } catch {
      setPostsError("Error al cargar mis posts");
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleUpdatePost = async (id: string, data: { title: string; content: string }) => {
    await postService.update(id, data);
    await fetchMyPosts();
  };

  const handleDeletePost = async (id: string) => {
    await postService.delete(id);
    await fetchMyPosts();
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
    } catch {
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

    const payload = {
      displayName: displayName.trim() ? displayName.trim() : null,
      bio: bio.trim() ? bio.trim() : null,
      avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
      coverUrl: coverUrl.trim() ? coverUrl.trim() : null,
      location: location.trim() ? location.trim() : null,
      website: website.trim() ? website.trim() : null
    };

    const hasAnyField = Object.values(payload).some((v) => v !== null);
    if (!hasAnyField) {
      setProfileError("Completa al menos un campo para actualizar.");
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
    } catch {
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
  const websiteHref = website?.startsWith("http") ? website : `https://${website}`;

  return (
    <div className="section">
      {/* ─── PERFIL (VISTA O EDICIÓN) ─── */}
      <div className="card">
        {!isEditingProfile ? (
          // ─── VISTA DE PERFIL (SOLO LECTURA) ───
          <div className="profile-header-row">
            <div className="profile-view">
              <div className="avatar avatar-lg">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
                  />
                ) : (
                  user?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="profile-view-info">
                <h2>{displayName || user?.username}</h2>
                <p className="username">@{user?.username}</p>
                {bio && <p className="bio">{bio}</p>}
                <div className="profile-view-meta">
                  {location && <span>📍 {location}</span>}
                  {website && (
                    <a href={websiteHref} target="_blank" rel="noreferrer">
                      🔗 {website}
                    </a>
                  )}
                </div>
              </div>
            </div>
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
          </div>
        ) : (
          // ─── FORMULARIO DE EDICIÓN ───
          <>
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
          </>
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

        {postsError && <p style={{ color: "var(--color-danger)" }}>{postsError}</p>}
        {postsLoading && posts.length === 0 && (
          <p className="text-secondary">Cargando posts...</p>
        )}
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