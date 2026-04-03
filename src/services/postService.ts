import { httpClient } from "../infrastructure/http/httpClient";
import type { Post, PostWithAuthor, PaginatedPosts, CreatePostDTO } from "../types/post";

export const postService = {
  // Listar todos los posts (feed público) - con paginación
getAll: async (page = 1, limit = 10): Promise<PaginatedPosts> => {
  const res = await httpClient.get("/posts", { params: { page, limit } });
  return res.data; // ahora res.data tiene { data, meta }
},

  // Obtener mis posts (del usuario logueado)
  getMyPosts: async (): Promise<PostWithAuthor[]> => {
    const res = await httpClient.get("/posts/me");
    return res.data;
  },

  // Crear post
  create: async (data: CreatePostDTO): Promise<Post> => {
    const res = await httpClient.post("/posts/new", data);
    return res.data;
  },

  // Actualizar post
  update: async (id: string, data: { title?: string; content?: string }): Promise<Post> => {
    const res = await httpClient.put(`/posts/${id}`, data);
    return res.data;
  },

  // Eliminar post
  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/posts/${id}`);
  },
};