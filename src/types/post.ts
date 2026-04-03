export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  username: string;
}
// Post con autor incluido (findAll, findByAuthorId)
export interface PostWithAuthor {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: Author;
}

// Respuesta paginada del backend
export interface PaginatedPosts {
  data: PostWithAuthor[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
// DTOs para crear post
export interface CreatePostDTO {
  title: string;
  content: string;
}