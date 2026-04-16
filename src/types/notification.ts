export interface Notification {
  id: string;
  userId: string;
  type: 'COMMENT_ON_POST' | 'REPLY_ON_COMMENT';
  title: string;
  message: string;
  read: boolean;
  actorId: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
}

export interface NotificationsPaginatedResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkAsReadResponse {
  success: boolean;
}

export interface MarkAllAsReadResponse {
  count: number;
}
