"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteWishlist } from "@/lib/api/wishlist";

interface WishlistOwnerActionsProps {
  wishlistId: string;
}

export function WishlistOwnerActions({ wishlistId }: WishlistOwnerActionsProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    try {
      await deleteWishlist(wishlistId);
      router.push("/wishlist");
    } catch {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center gap-2 rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        <Trash2 className="size-4" />
        {confirming ? "Xác nhận xóa?" : "Xóa wishlist"}
      </button>
      {confirming && (
        <button
          onClick={() => setConfirming(false)}
          className="rounded-full border border-[var(--border-green)] px-4 py-2 text-sm text-muted-foreground hover:bg-[var(--bg-cream)] transition-colors"
        >
          Hủy
        </button>
      )}
    </div>
  );
}
