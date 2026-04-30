import Link from "next/link";
import Image from "next/image";
import { Pin } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";

interface NewsCardProps {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  description: string;
  publishedAt: string;
  isPinned?: boolean;
}

const CATEGORY_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  event: { label: "Sự kiện", variant: "news-event" },
  story: { label: "Câu chuyện", variant: "news-story" },
  guide: { label: "Hướng dẫn", variant: "news-guide" },
  announcement: { label: "Thông báo", variant: "news-announcement" },
};

export function NewsCard({
  id,
  title,
  thumbnail,
  category,
  description,
  publishedAt,
  isPinned = false,
}: NewsCardProps) {
  const cat = CATEGORY_BADGE[category] || {
    label: category,
    variant: "default" as BadgeVariant,
  };

  return (
    <Link
      href={`/news/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-[15px] border border-[var(--border-green)] bg-white transition-shadow hover:shadow-lg"
    >
      {isPinned && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-brand-dark px-2 py-0.5 text-xs font-medium text-white">
          <Pin className="size-3" />
          Ghim
        </div>
      )}
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden bg-brand-light/30">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-brand-muted">
            📰
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Badge variant={cat.variant} className="self-start mb-2">
          {cat.label}
        </Badge>
        <h3 className="font-heading text-lg font-semibold leading-snug text-brand-darker line-clamp-2">
          {title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
}
