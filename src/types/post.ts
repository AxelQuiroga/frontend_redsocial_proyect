// Base Post (sin autor)
export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Autor embebido (como devuelve el backend)
export interface Author {
  id: string;
  username: string;
}

// Post con autor incluido (findAll, findByAuthorId)
export interface PostWithAuthor extends Post {
  author: Author;
}

// Respuesta paginada del backend
export interface PaginatedPosts {
  posts: PostWithAuthor[];
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