import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTimeVN } from "@/lib/utils";
import { CONDITION_LABEL } from "@/lib/postLabels";
import type { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
}

const ROLE_LABELS: Record<string, string> = {
  ngo: "Tổ chức",
  individual: "Cá nhân",
  member: "Thành viên",
  admin: "Admin",
};

export function PostCard({ post }: PostCardProps) {
  const author =
    typeof post.author === "string"
      ? null
      : post.author;
  const coverImage = post.images?.[0];

  return (
    <Link
      href={`/posts/${post._id}`}
      className="group flex flex-col overflow-hidden rounded-[15px] border border-[var(--border-green)] bg-white transition-shadow hover:shadow-lg"
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-light/30">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-brand-muted">
            🍃
          </div>
        )}
        {/* Condition badge */}
        <div className="absolute left-3 top-3">
          <Badge variant="condition">
            {CONDITION_LABEL[post.condition] || post.condition}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-lg font-semibold leading-snug text-brand-darker line-clamp-2">
          {post.title}
        </h3>
        {post.description && (
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
            {post.description}
          </p>
        )}

        {/* Author row */}
        {author && (
          <div className="mt-auto flex items-center gap-2 pt-4">
            <Avatar src={author.avatar} alt={author.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-darker">
                {author.name}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    author.role === "ngo"
                      ? "role-ngo"
                      : author.role === "individual"
                        ? "role-individual"
                        : "role-member"
                  }
                  className="text-[10px] px-2 py-0.5"
                >
                  {ROLE_LABELS[author.role] || author.role}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {formatRelativeTimeVN(post.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
