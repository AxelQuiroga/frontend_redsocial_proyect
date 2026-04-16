export interface ProfileBase {
  id: string;
  username?: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  location: string | null;
  website: string | null;
  createdAt: string; // ISO
}

export type UserPublicProfile = ProfileBase;


// Perfil privado (lo ve el dueño)
export interface UserPrivateProfile extends ProfileBase {
  email: string;
  updatedAt: string; // ISO
}

// Payload para actualizar perfil
export interface UpdateProfilePayload {
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  location?: string | null;
  website?: string | null;

  // si decidiste permitir editar email/username en el mismo endpoint:
  email?: string;
  username?: string;
}
