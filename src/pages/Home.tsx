import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postService } from "../services/postService";
import { useAuth } from "../hooks/useAuth";
import type { PostWithAuthor } from "../types/post";
import { PostCard } from "../components/PostCard";

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await postService.getMyPosts();
        setPosts(data);
      } catch {
        setError("Error al cargar los posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <p className="text-secondary">Cargando posts...</p>;
  if (error) return <p style={{ color: "var(--color-danger)" }}>{error}</p>;

  return (
    <div className="container">
      <div className="header">
        <div className="user-info">
          <div className="avatar avatar-lg">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h1>{user?.username}</h1>
            <p>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          Cerrar sesión
        </button>
      </div>

      <h2 style={{ marginBottom: "var(--space-md)" }}>Mis Posts</h2>
      
      {posts.length === 0 ? (
        <p className="text-secondary">
          No tienes posts aún. ¡Crea tu primer post!
        </p>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}