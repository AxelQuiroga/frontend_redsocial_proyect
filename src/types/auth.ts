import type { UserPrivateProfile } from "./profile";

export type User = UserPrivateProfile;

export interface LoginResponse {
  token: string;
}
 
