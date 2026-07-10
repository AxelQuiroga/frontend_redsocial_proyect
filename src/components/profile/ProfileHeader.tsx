import { MapPin, Link as LinkIcon, Pencil } from "lucide-react";
import type { User } from "@/types/auth";

interface ProfileHeaderProps {
  user: User;
  displayName: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  coverUrl: string | null;
  avatarUrl: string | null;
  postsCount: number;
  onStartEdit: () => void;
}

export function ProfileHeader({
  user,
  displayName,
  bio,
  location,
  website,
  coverUrl,
  avatarUrl,
  postsCount,
  onStartEdit,
}: ProfileHeaderProps) {
  const websiteHref =
    website && website.trim()
      ? website.startsWith("http") ? website : `https://${website}`
      : undefined;

  return (
    <div className="card">
      <div
        className="profile-cover-custom"
        style={{
          background: coverUrl
            ? `url(${coverUrl})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      />

      <div className="profile-avatar-container">
        <div className="profile-avatar-custom">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span>{displayName?.charAt(0).toUpperCase() || "?"}</span>
          )}
        </div>
        <div style={{ marginLeft: "20px", flex: 1, marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "24px" }}>
            {displayName || "Usuario"}
          </h2>
          <p className="username" style={{ margin: "4px 0 0" }}>
            @{user?.username || "usuario"}
          </p>
          {bio && (
            <p className="bio" style={{ margin: "8px 0 0" }}>
              {bio}
            </p>
          )}
          <div className="profile-view-meta" style={{ marginTop: "12px" }}>
            {location && <span><MapPin size={16} /> {location}</span>}
            {websiteHref && (
              <a href={websiteHref} target="_blank" rel="noreferrer">
                <LinkIcon size={16} /> {website}
              </a>
            )}
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onStartEdit}
            title="Editar perfil"
          >
            <Pencil size={16} /> Editar
          </button>
        </div>
      </div>

      <div className="profile-stats">
        <div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {postsCount}
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>Posts</div>
        </div>
        <div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>Se unió</div>
        </div>
      </div>
    </div>
  );
}
