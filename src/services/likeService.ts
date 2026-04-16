import { httpClient } from "../infrastructure/http/httpClient";
import type { LikeResponse, LikeCountResponse } from "../types/like";

export const likeService = {
  like: async (postId: string): Promise<LikeResponse> => {
    const res = await httpClient.post(`/posts/${postId}/like`);
    return res.data;
  },

  unlike: async (postId: string): Promise<void> => {
    await httpClient.delete(`/posts/${postId}/like`);
  },

  getLikes: async (postId: string): Promise<LikeCountResponse> => {
    const res = await httpClient.get(`/posts/${postId}/likes`);
    return res.data;
  }
};
