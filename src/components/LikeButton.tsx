import { useState, useEffect } from "react";
import { likeService } from "../services/likeService";

interface LikeButtonProps {
  postId: string;
}

export function LikeButton({ postId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const fetchInitialLikes = async () => {
      try {
        const data = await likeService.getLikes(postId);
        setLiked(data.userHasLiked);
        setCount(data.likesCount);
      } catch (error) {
        console.error("Error loading initial likes:", error);
        // Fallback a valores por defecto
        setLiked(false);
        setCount(0);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialLikes();
  }, [postId]);

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
      // Revertir al estado anterior en caso de error
      setLiked((prev) => !prev);
      setCount((prev) => liked ? prev + 1 : prev - 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || isInitialLoading}
      style={{
        border: "none",
        background: "none",
        cursor: isLoading || isInitialLoading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        color: liked ? "#e0245e" : "#6b7280",
        fontSize: "14px"
      }}
    >
      <span>{isInitialLoading ? "⏳" : (liked ? "❤️" : "🤍")}</span>
      <span>{isInitialLoading ? "..." : count}</span>
    </button>
  );
}
