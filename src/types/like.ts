export interface LikeResponse {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface LikeCountResponse {
  count: number;
  userHasLiked: boolean;
}
