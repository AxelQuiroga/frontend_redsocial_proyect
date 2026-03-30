import type { PostWithAuthor } from "../types/post";

interface PostCardProps {
  post: PostWithAuthor;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div
      style={{
        border: "1px solid #e1e4e8",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            marginRight: "12px",
          }}
        >
          {post.author.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 style={{ margin: 0, color: "#1f2937" }}>{post.author.username}</h4>
          <small style={{ color: "#6b7280" }}>
            {new Date(post.createdAt).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </small>
        </div>
      </div>

      <h3 style={{ margin: "0 0 10px 0", color: "#111827", fontSize: "1.25rem" }}>
        {post.title}
      </h3>
      
      <p style={{ margin: 0, color: "#4b5563", lineHeight: "1.6" }}>
        {post.content}
      </p>
    </div>
  );
}