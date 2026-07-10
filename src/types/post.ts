import type { PostImage } from "./image";

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
  likesCount?: number;
  userHasLiked?: boolean;
  /** Imágenes del post (se cargan aparte con GET /posts/:id/images) */
  images?: PostImage[];
}

// Respuesta paginada del backend
export interface PaginatedPosts {
  data: PostWithAuthor[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    fromFollowed?: number;
  };
}

// DTOs para crear post
export interface CreatePostDTO {
  title: string;
  content: string;
}
