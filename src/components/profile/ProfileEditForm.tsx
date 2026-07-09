import { useState, useEffect } from "react";
import { userService } from "@/services/userService";
import type { User } from "@/types/auth";

interface ProfileEditFormProps {
  user: User;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export function ProfileEditForm({
  user,
  onSaveSuccess,
  onCancel,
}: ProfileEditFormProps) {
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(user?.coverUrl ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [website, setWebsite] = useState(user?.website ?? "");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    setBio(user.bio ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
    setCoverUrl(user.coverUrl ?? "");
    setLocation(user.location ?? "");
    setWebsite(user.website ?? "");
  }, [user]);

  const resetForm = () => {
    setDisplayName(user?.displayName ?? "");
    setBio(user?.bio ?? "");
    setAvatarUrl(user?.avatarUrl ?? "");
    setCoverUrl(user?.coverUrl ?? "");
    setLocation(user?.location ?? "");
    setWebsite(user?.website ?? "");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

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

    if (Object.keys(payload).length === 0) {
      setError("Modifica al menos un campo para actualizar.");
      setIsSaving(false);
      return;
    }

    try {
      await userService.updateProfile(payload);
      setSuccess("Perfil actualizado.");
      onSaveSuccess();
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setError("Error al actualizar el perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <div className="card">
      <div
        className="profile-edit-section"
        style={{ padding: 0, borderTop: "none", marginTop: 0 }}
      >
        <div
          className="profile-header-row"
          style={{ marginBottom: "var(--space-md)" }}
        >
          <h3 className="section-title">Editar perfil</h3>
        </div>

        {error && (
          <p style={{ color: "var(--color-danger)", marginBottom: "var(--space-sm)" }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ color: "var(--color-success)", marginBottom: "var(--space-sm)" }}>
            {success}
          </p>
        )}

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="editDisplayName">Nombre visible</label>
            <input
              id="editDisplayName"
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Cómo quieres que te llamen"
            />
          </div>

          <div className="form-group">
            <label htmlFor="editLocation">Ubicación</label>
            <input
              id="editLocation"
              className="input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad, País"
            />
          </div>

          <div className="form-group full">
            <label htmlFor="editBio">Bio</label>
            <textarea
              id="editBio"
              className="input"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos sobre ti..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="editAvatarUrl">URL del avatar</label>
            <input
              id="editAvatarUrl"
              className="input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="editCoverUrl">URL del cover</label>
            <input
              id="editCoverUrl"
              className="input"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="editWebsite">Sitio web</label>
            <input
              id="editWebsite"
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
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
