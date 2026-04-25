import Link from "next/link";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { CATEGORY_LABEL } from "@/lib/postLabels";
import type { WishlistPost } from "@/types/wishlist";

interface WishlistCardProps {
  item: WishlistPost;
}

const STATUS_LABEL: Record<string, string> = {
  open: "Đang cần",
  fulfilled: "Đã đủ",
};

export function WishlistCard({ item }: WishlistCardProps) {
  const author = item.author;
  const thumbnail = item.images[0];

  return (
    <Link
      href={`/wishlist/${item._id}`}
      className="group flex flex-col rounded-[15px] border border-[var(--border-green)] bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-[var(--bg-cream)] overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.title}
            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="size-full flex items-center justify-center text-muted-foreground text-sm">
            Không có ảnh
          </div>
        )}
        {item.isPinned && (
          <span className="absolute top-2 left-2">
            <Badge variant="pinned">Ghim</Badge>
          </span>
        )}
        <span className="absolute top-2 right-2">
          <Badge variant={item.status === "open" ? "success" : "default"}>
            {STATUS_LABEL[item.status]}
          </Badge>
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="category">{CATEGORY_LABEL[item.category] ?? item.category}</Badge>
          <Badge variant="info">x{item.quantity}</Badge>
        </div>
        <h3 className="font-medium text-brand-darker line-clamp-2 group-hover:text-brand-dark transition-colors">
          {item.title}
        </h3>

        {/* Author */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar src={author.avatar} alt={author.name} size="sm" />
            <span className="text-xs text-muted-foreground truncate">{author.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Heart className="size-3" />
            <span>{item.likesCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
