import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userService } from "../services/userService";
import type { UserPublicProfile } from "../types/profile";

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!username) return;
        const data = await userService.getUserProfile(username);
        setProfile(data);
      } catch {
        setError("No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) return <p className="text-secondary">Cargando perfil...</p>;
  if (error) return <p style={{ color: "var(--color-danger)" }}>{error}</p>;
  if (!profile) return <p className="text-secondary">Perfil no encontrado</p>;

  const websiteHref = profile.website
    ? profile.website.startsWith("http://") || profile.website.startsWith("https://")
      ? profile.website
      : `https://${profile.website}`
    : "";

  return (
    <div className="section">
      <div className="card profile-card">
        <div
          className="profile-cover"
          style={{
            backgroundImage: profile.coverUrl ? `url(${profile.coverUrl})` : undefined
          }}
        />

        <div className="profile-header">
          {profile.avatarUrl ? (
            <img
              className="profile-avatar"
              src={profile.avatarUrl}
              alt={`Avatar de ${profile.displayName || profile.username}`}
            />
          ) : (
            <div className="avatar avatar-lg profile-avatar">
              {(profile.displayName || profile.username)[0]?.toUpperCase()}
            </div>
          )}

          <div>
            <h2 className="section-title">{profile.displayName || profile.username}</h2>
            <p className="text-secondary">@{profile.username}</p>
          </div>
        </div>

        <div className="profile-meta">
          {profile.bio && <p>{profile.bio}</p>}

          <div className="profile-badges">
            {profile.location && <span>ðŸ“ {profile.location}</span>}
            {profile.website && (
              <a href={websiteHref} target="_blank" rel="noreferrer">
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* MÃ¡s adelante: posts de este usuario */}
    </div>
  );
}
