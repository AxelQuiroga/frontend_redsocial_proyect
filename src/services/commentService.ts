import { httpClient } from "../infrastructure/http/httpClient";
import type { Comment, CreateCommentDTO, UpdateCommentDTO } from "../types/comment";

export const commentService = {
  create: async (postId: string, data: CreateCommentDTO): Promise<Comment> => {
    const res = await httpClient.post(`/posts/${postId}/comments`, data);
    return res.data;
  },

  getByPost: async (postId: string, page = 1, limit = 10): Promise<{ data: Comment[]; meta: { page: number; limit: number; total: number; totalPages: number } }> => {
    const res = await httpClient.get(`/posts/${postId}/comments`, { params: { page, limit } });
    return res.data;
  },

  update: async (commentId: string, data: UpdateCommentDTO): Promise<Comment> => {
    const res = await httpClient.put(`/comments/${commentId}`, data);
    return res.data;
  },

  delete: async (commentId: string): Promise<void> => {
    await httpClient.delete(`/comments/${commentId}`);
  },

  getReplies: async (commentId: string, page = 1, limit = 10): Promise<{ data: Comment[]; meta: { page: number; limit: number; total: number; totalPages: number } }> => {
    const res = await httpClient.get(`/comments/${commentId}/replies`, { params: { page, limit } });
    return res.data;
  }
};
