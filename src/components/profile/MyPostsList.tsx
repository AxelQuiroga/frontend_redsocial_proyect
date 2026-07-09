import type { PostWithAuthor } from "@/types/post";
import { PostCard } from "@/components/PostCard";

interface MyPostsListProps {
  posts: PostWithAuthor[];
  isLoading: boolean;
  error: string;
  currentUserId?: string;
  onEdit: (id: string, data: { title: string; content: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function MyPostsList({
  posts,
  isLoading,
  error,
  currentUserId,
  onEdit,
  onDelete,
}: MyPostsListProps) {
  if (isLoading) {
    return <p className="text-secondary">Cargando posts...</p>;
  }

  if (error) {
    return <p style={{ color: "var(--color-danger)" }}>{error}</p>;
  }

  if (posts.length === 0) {
    return (
      <p className="text-secondary">
        No tienes posts aún. ¡Crea tu primer post!
      </p>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
