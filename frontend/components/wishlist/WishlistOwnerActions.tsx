"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle2, RotateCcw } from "lucide-react";
import { deleteWishlist, toggleWishlistStatus } from "@/lib/api/wishlist";

interface WishlistOwnerActionsProps {
  wishlistId: string;
  status: "open" | "fulfilled";
  isOwner: boolean;
  isAdmin?: boolean;
}

export function WishlistOwnerActions({
  wishlistId,
  status,
  isOwner,
  isAdmin = false,
}: WishlistOwnerActionsProps) {
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

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      await toggleWishlistStatus(wishlistId);
      router.refresh();
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const canDelete = isOwner || isAdmin;

  return (
    <div className="flex flex-wrap gap-2">
      {/* Toggle fulfilled — owner only */}
      {isOwner && (
        <button
          onClick={handleToggleStatus}
          disabled={loading}
          className="flex items-center gap-2 rounded-full border border-brand-dark px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-light transition-colors disabled:opacity-50"
        >
          {status === "open" ? (
            <>
              <CheckCircle2 className="size-4" />
              Đánh dấu đã đáp ứng
            </>
          ) : (
            <>
              <RotateCcw className="size-4" />
              Mở lại wishlist
            </>
          )}
        </button>
      )}

      {/* Delete — owner or admin */}
      {canDelete && (
        <>
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
        </>
      )}
    </div>
  );
}
