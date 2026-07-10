import { useState, useEffect, useCallback } from "react";
import { Heart, LoaderCircle } from "lucide-react";
import { likeService } from "@/services/likeService";

interface LikeButtonProps {
  postId: string;
}

export function LikeButton({ postId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [heartAnimating, setHeartAnimating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialLikes = async () => {
      try {
        const data = await likeService.getLikes(postId);
        if (isMounted) {
          setLiked(data.userHasLiked);
          setCount(data.likesCount);
        }
      } catch (error) {
        console.error("Error loading initial likes:", error);
        if (isMounted) {
          setLiked(false);
          setCount(0);
        }
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };

    fetchInitialLikes();
    return () => { isMounted = false; };
  }, [postId]);

  const handleToggle = useCallback(async () => {
    if (isLoading || isInitialLoading) return;
    
    const originalLiked = liked;
    const originalCount = count;
    
    setLiked(!originalLiked);
    setCount(originalLiked ? originalCount - 1 : originalCount + 1);
    setIsLoading(true);
    if (!originalLiked) setHeartAnimating(true);
    
    try {
      if (originalLiked) {
        await likeService.unlike(postId);
      } else {
        await likeService.like(postId);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setLiked(originalLiked);
      setCount(originalCount);
    } finally {
      setIsLoading(false);
    }
  }, [liked, count, isLoading, isInitialLoading, postId]);

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
      {heartAnimating && (
        <span
          onAnimationEnd={() => setHeartAnimating(false)}
          style={{ display: "none" }}
        />
      )}
      <span>
        {isInitialLoading ? (
          <LoaderCircle size={18} className="animate-spin" />
        ) : (
          <Heart
            size={18}
            className={`like-btn-heart${heartAnimating ? " like-btn-heart--animate" : ""}${liked ? " like-btn-heart--active" : ""}`}
            fill={liked ? "#e0245e" : "none"}
            color={liked ? "#e0245e" : undefined}
          />
        )}
      </span>
      <span>{isInitialLoading ? "..." : count}</span>
    </button>
  );
}
