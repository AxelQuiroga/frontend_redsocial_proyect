export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
}

export interface CommentWithAuthor extends Comment {
  author: {
    id: string;
    username: string;
  };
}

export interface CreateCommentDTO {
  content: string;
  parentId?: string;
}

export interface UpdateCommentDTO {
  content: string;
}
