"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleLikeWishlist } from "@/lib/api/wishlist";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  wishlistId: string;
  initialLikes: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
}

export function LikeButton({
  wishlistId,
  initialLikes,
  initialLiked,
  isAuthenticated,
}: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (loading) return;

    // Optimistic update
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));
    setLoading(true);

    try {
      const res = await toggleLikeWishlist(wishlistId);
      setLiked(res.data!.liked);
      setCount(res.data!.likesCount);
    } catch {
      // Rollback on error
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        liked
          ? "border-red-300 bg-red-50 text-red-500"
          : "border-[var(--border-green)] bg-white text-muted-foreground hover:text-brand-dark",
      )}
    >
      <Heart className={cn("size-4", liked && "fill-red-500 text-red-500")} />
      <span>{count}</span>
    </button>
  );
}
