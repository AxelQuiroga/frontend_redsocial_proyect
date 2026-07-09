import axios from "axios";
import { tokenStorage } from "@/infrastructure/tokenStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const httpClient = axios.create({
  baseURL: API_URL,
});

httpClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_ROUTES = ["/users/login", "/users/register"];

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = AUTH_ROUTES.some((route) =>
      error.config?.url?.includes(route)
    );

    if (error.response?.status === 401 && !isAuthRoute) {
      tokenStorage.remove();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);