import { useEffect, useState, useCallback } from "react";
import { postService } from "@/services/postService";
import { useAuth } from "@/hooks/useAuth";
import type { PostWithAuthor } from "@/types/post";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { CreatePostForm } from "@/components/profile/CreatePostForm";
import { MyPostsList } from "@/components/profile/MyPostsList";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const fetchMyPosts = useCallback(async () => {
    if (!user) return;
    try {
      setPostsLoading(true);
      setPostsError("");
      const data = await postService.getMyPosts();
      setPosts(data);
    } catch (err) {
      console.error("Error al cargar posts:", err);
      setPostsError("Error al cargar mis posts");
    } finally {
      setPostsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const handleUpdatePost = useCallback(
    async (id: string, data: { title: string; content: string }) => {
      try {
        await postService.update(id, data);
        await fetchMyPosts();
      } catch (err) {
        console.error("Error al actualizar post:", err);
        setPostsError("Error al actualizar el post");
      }
    },
    [fetchMyPosts]
  );

  const handleDeletePost = useCallback(
    async (id: string) => {
      try {
        await postService.delete(id);
        await fetchMyPosts();
      } catch (err) {
        console.error("Error al eliminar post:", err);
        setPostsError("Error al eliminar el post");
      }
    },
    [fetchMyPosts]
  );

  const handleProfileSaveSuccess = useCallback(async () => {
    await refreshUser();
    setIsEditingProfile(false);
  }, [refreshUser]);

  if (!user) return null;

  return (
    <div className="section">
      {/* ─── PERFIL ─── */}
      {isEditingProfile ? (
        <ProfileEditForm
          user={user}
          onSaveSuccess={handleProfileSaveSuccess}
          onCancel={() => setIsEditingProfile(false)}
        />
      ) : (
        <ProfileHeader
          user={user}
          displayName={user.displayName ?? ""}
          bio={user.bio}
          location={user.location}
          website={user.website}
          coverUrl={user.coverUrl}
          avatarUrl={user.avatarUrl}
          postsCount={posts.length}
          onStartEdit={() => setIsEditingProfile(true)}
        />
      )}

      {/* ─── CREAR POST ─── */}
      <CreatePostForm onPostCreated={fetchMyPosts} />

      {/* ─── MIS POSTS ─── */}
      <div>
        <h2 className="section-title">Mis Posts</h2>
        <MyPostsList
          posts={posts}
          isLoading={postsLoading}
          error={postsError}
          currentUserId={user?.id}
          onEdit={handleUpdatePost}
          onDelete={handleDeletePost}
        />
      </div>
    </div>
  );
}