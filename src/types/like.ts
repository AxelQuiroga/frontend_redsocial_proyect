export interface LikeResponse {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface LikeCountResponse {
  postId: string;
  likesCount: number;
  userHasLiked: boolean;
}
