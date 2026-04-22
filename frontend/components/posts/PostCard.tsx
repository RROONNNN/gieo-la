import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTimeVN } from "@/lib/utils";
import type { Post } from "@/types/post";
import { CATEGORY_LABEL, CONDITION_LABEL, STATUS_LABEL, STATUS_VARIANT } from "@/lib/postLabels";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {post.images[0] ? (
          <Image
            src={post.images[0]}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Không có ảnh
          </div>
        )}
        {post.isPinned && (
          <div className="absolute left-2 top-2 rounded-md bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
            Ghim
          </div>
        )}
        <Badge
          variant={STATUS_VARIANT[post.status] ?? "default"}
          className="absolute right-2 top-2"
        >
          {STATUS_LABEL[post.status]}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary-600">
          {post.title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="info">{CATEGORY_LABEL[post.category]}</Badge>
          <Badge>{CONDITION_LABEL[post.condition]}</Badge>
          <span className="text-xs text-muted-foreground">SL: {post.quantity}</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {post.location?.city || "Hà Nội"}
          </span>
          <span>{formatRelativeTimeVN(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
