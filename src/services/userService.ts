import { httpClient } from "../infrastructure/http/httpClient";
import type { LoginResponse } from "../types/auth";

export const userService = {
  getMe: async () => {
    const res = await httpClient.get("/users/me");
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
};