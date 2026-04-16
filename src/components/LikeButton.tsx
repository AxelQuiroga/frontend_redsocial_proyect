import { useState } from "react";
import { likeService } from "../services/likeService";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (liked) {
        await likeService.unlike(postId);
        setLiked(false);
        setCount((prev) => prev - 1);
      } else {
        await likeService.like(postId);
        setLiked(true);
        setCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setLiked(initialLiked);
      setCount(initialCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      style={{
        border: "none",
        background: "none",
        cursor: isLoading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        color: liked ? "#e0245e" : "#6b7280",
        fontSize: "14px"
      }}
    >
      <span>{liked ? "❤️" : "🤍"}</span>
      <span>{count}</span>
    </button>
  );
}
