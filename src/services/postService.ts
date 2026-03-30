import { httpClient } from "../infrastructure/http/httpClient";
import type { Post, PostWithAuthor, PaginatedPosts, CreatePostDTO } from "../types/post";

export const postService = {
  // Listar todos los posts (feed público) - con paginación
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedPosts> => {
    const res = await httpClient.get("/posts", {
      params: { page, limit }
    });
    return res.data;
  },

  // Obtener mis posts (del usuario logueado)
  getMyPosts: async (): Promise<PostWithAuthor[]> => {
    const res = await httpClient.get("/posts/posts/me");
    return res.data;
  },

  // Crear post
  create: async (data: CreatePostDTO): Promise<Post> => {
    const res = await httpClient.post("/posts/new", data);
    return res.data;
  },

  // Eliminar post
  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/posts/posts/${id}`);
  },
};