import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package, Tag } from "lucide-react";
import { fetchWishlistItem } from "@/lib/api/wishlist";
import { getCurrentUserFromCookie } from "@/lib/auth/server";
import { LikeButton } from "@/components/wishlist/LikeButton";
import { WishlistOwnerActions } from "@/components/wishlist/WishlistOwnerActions";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { CATEGORY_LABEL } from "@/lib/postLabels";
import { formatRelativeTimeVN } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  open: "Đang cần",
  fulfilled: "Đã đủ",
};

export default async function WishlistDetailPage({ params }: PageProps) {
  const { id } = await params;

  let item;
  try {
    item = await fetchWishlistItem(id);
  } catch {
    notFound();
  }

  const viewer = await getCurrentUserFromCookie();
  const author = item.author;
  const isOwn = viewer !== null && viewer._id === author._id;
  const isAuthenticated = viewer !== null;
  const initialLiked =
    isAuthenticated && item.likes.includes(viewer!._id);

  return (
    <div className="py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/wishlist" className="hover:text-brand-dark">
          Wishlist
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-brand-darker">
          {CATEGORY_LABEL[item.category] ?? item.category}
        </span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left: image gallery */}
        <div className="w-full lg:w-[480px] shrink-0">
          {item.images.length > 0 ? (
            <div className="space-y-3">
              <div className="aspect-square overflow-hidden rounded-[15px] border border-[var(--border-green)] bg-[var(--bg-cream)]">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="size-full object-cover"
                />
              </div>
              {item.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {item.images.slice(1).map((url, i) => (
                    <div
                      key={i}
                      className="size-16 shrink-0 overflow-hidden rounded-[10px] border border-[var(--border-green)]"
                    >
                      <img src={url} alt="" className="size-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square rounded-[15px] border border-[var(--border-green)] bg-[var(--bg-cream)] flex items-center justify-center text-muted-foreground">
              Không có ảnh
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="flex-1 space-y-6">
          {/* Status + pinned */}
          <div className="flex flex-wrap gap-2">
            {item.isPinned && <Badge variant="pinned">Ghim</Badge>}
            <Badge variant={item.status === "open" ? "success" : "default"}>
              {STATUS_LABEL[item.status]}
            </Badge>
            <Badge variant="category">
              {CATEGORY_LABEL[item.category] ?? item.category}
            </Badge>
          </div>

          <h1 className="font-heading text-3xl font-bold text-brand-darker">{item.title}</h1>

          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="size-4 text-brand-dark" />
              <span>Cần <strong className="text-brand-darker">{item.quantity}</strong> sản phẩm</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="size-4 text-brand-dark" />
              <span>{CATEGORY_LABEL[item.category]}</span>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="rounded-[15px] border border-[var(--border-green)] bg-white p-5">
              <h2 className="mb-2 font-medium text-brand-darker">Mô tả</h2>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          )}

          {/* Author card */}
          <Link
            href={`/profile/${author._id}`}
            className="flex items-center gap-3 rounded-[15px] border border-[var(--border-green)] bg-white p-4 hover:shadow-sm transition-shadow"
          >
            <Avatar src={author.avatar} alt={author.name} size="md" />
            <div>
              <p className="text-sm font-medium text-brand-darker">{author.name}</p>
              <p className="text-xs text-muted-foreground">
                Đăng {formatRelativeTimeVN(item.createdAt)}
              </p>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <LikeButton
              wishlistId={item._id}
              initialLikes={item.likesCount}
              initialLiked={initialLiked}
              isAuthenticated={isAuthenticated}
            />
            {isOwn && <WishlistOwnerActions wishlistId={item._id} />}
          </div>
        </div>
      </div>
    </div>
  );
}
