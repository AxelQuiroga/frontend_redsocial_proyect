import { useState, useEffect, useCallback } from "react";
import { followService } from "@/services/followService";

interface FollowButtonProps {
  userId: string;
  /** Callback opcional cuando cambia el estado de follow (ej. para actualizar counts) */
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({ userId, onFollowChange }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    followService
      .getStatus(userId)
      .then((data) => {
        if (!cancelled) setIsFollowing(data.isFollowing);
      })
      .catch(() => {
        if (!cancelled) setIsFollowing(false);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleToggle = useCallback(async () => {
    if (isToggling || isLoading) return;

    const previous = isFollowing;
    setIsToggling(true);

    // Optimistic update
    setIsFollowing(!previous);
    onFollowChange?.(!previous);

    try {
      if (previous) {
        await followService.unfollow(userId);
      } else {
        await followService.follow(userId);
      }
    } catch {
      // Revert on error
      setIsFollowing(previous);
      onFollowChange?.(previous);
    } finally {
      setIsToggling(false);
    }
  }, [userId, isFollowing, isToggling, isLoading, onFollowChange]);

  if (isLoading) {
    return (
      <button className="btn btn-secondary" disabled>
        ...
      </button>
    );
  }

  return (
    <button
      className={`btn ${isFollowing ? "btn-following" : "btn-primary"}`}
      onClick={handleToggle}
      disabled={isToggling}
    >
      {isToggling ? "..." : isFollowing ? "Siguiendo" : "Seguir"}
    </button>
  );
}
