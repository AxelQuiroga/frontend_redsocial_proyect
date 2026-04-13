import { httpClient } from "../infrastructure/http/httpClient";
import type { LoginResponse } from "../types/auth";
import type { UserPrivateProfile, UserPublicProfile, UpdateProfilePayload } from "../types/profile";

export const userService = {
  getMe: async (): Promise<UserPrivateProfile> => {
  const res = await httpClient.get("/users/me");
  return res.data;
},

getUserProfile: async (username: string): Promise<UserPublicProfile> => {
  const res = await httpClient.get(`/users/u/${username}`);
  return res.data;
},

  login: async (email: string, password: string): Promise<LoginResponse> =>{
    const res = await httpClient.post("/users/login", {
      email,
      password,
    });
    return res.data;
  },

  register: async (email: string, password: string, username: string) => {
  const res = await httpClient.post("/users/register", {
    email, password, username
  });
  return res.data;
},

updateProfile: async (data: UpdateProfilePayload): Promise<UserPrivateProfile> => {
  const res = await httpClient.put("/users/me", data);
  return res.data;
},

};