import { httpClient } from "@/infrastructure/http/httpClient";

export interface FollowCounts {
  followersCount: number;
  followingCount: number;
}

export interface FollowStatus {
  isFollowing: boolean;
}

export interface FollowUserItem {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface FollowUserListResponse {
  data: FollowUserItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const followService = {
  follow: async (userId: string): Promise<void> => {
    await httpClient.post(`/follow/${userId}/follow`);
  },

  unfollow: async (userId: string): Promise<void> => {
    await httpClient.delete(`/follow/${userId}/follow`);
  },

  getStatus: async (userId: string): Promise<FollowStatus> => {
    const res = await httpClient.get(`/follow/${userId}/follow/status`);
    return res.data;
  },

  getStatusBatch: async (userIds: string[]): Promise<Record<string, boolean>> => {
    const res = await httpClient.post("/follow/status/batch", { userIds });
    return res.data.status;
  },

  getCounts: async (userId: string): Promise<FollowCounts> => {
    const res = await httpClient.get(`/follow/${userId}/follow/counts`);
    return res.data;
  },

  getFollowers: async (userId: string, page = 1, limit = 20): Promise<FollowUserListResponse> => {
    const res = await httpClient.get(`/follow/${userId}/followers`, { params: { page, limit } });
    return res.data;
  },

  getFollowing: async (userId: string, page = 1, limit = 20): Promise<FollowUserListResponse> => {
    const res = await httpClient.get(`/follow/${userId}/following`, { params: { page, limit } });
    return res.data;
  },
};
