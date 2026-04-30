import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Pin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { fetchNewsDetail } from "@/lib/api/news";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { formatDateVN } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  event: { label: "Hoạt động cộng đồng", variant: "news-event" },
  story: { label: "Câu chuyện cảm hứng", variant: "news-story" },
  guide: { label: "Hướng dẫn sử dụng", variant: "news-guide" },
  announcement: { label: "Thông báo", variant: "news-announcement" },
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const post = await fetchNewsDetail(id);
    return {
      title: `${post.title} — Lá Lành`,
      description: post.content.slice(0, 160),
      openGraph: {
        title: post.title,
        description: post.content.slice(0, 160),
        images: post.thumbnail ? [{ url: post.thumbnail }] : [],
      },
    };
  } catch {
    return { title: "Bản tin — Lá Lành" };
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;

  let post;
  try {
    post = await fetchNewsDetail(id);
  } catch {
    notFound();
  }

  const cat = CATEGORY_BADGE[post.category] ?? {
    label: post.category,
    variant: "default" as BadgeVariant,
  };

  return (
    <div className="py-10">
      {/* Back link */}
      <Link
        href="/news"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-dark transition-colors"
      >
        <ArrowLeft className="size-4" />
        Quay lại Bản tin
      </Link>

      <article className="mx-auto max-w-3xl">
        {/* Thumbnail */}
        {post.thumbnail && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[15px]">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge variant={cat.variant}>{cat.label}</Badge>
          {post.isPinned && (
            <span className="flex items-center gap-1 rounded-full bg-brand-dark/10 px-2.5 py-0.5 text-xs font-medium text-brand-dark">
              <Pin className="size-3" />
              Ghim
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl font-bold leading-tight text-brand-darker sm:text-4xl">
          {post.title}
        </h1>

        {/* Date + Author */}
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          <span>
            {post.publishedAt
              ? formatDateVN(post.publishedAt)
              : formatDateVN(post.createdAt)}
          </span>
          <span className="mx-1 text-[var(--border-green)]">·</span>
          <span className="font-medium text-brand-dark">Ban quản trị Lá Lành</span>
        </div>

        {/* Divider */}
        <hr className="my-8 border-[var(--border-green)]" />

        {/* Content */}
        <div className="prose prose-sm max-w-none prose-headings:font-heading prose-headings:text-brand-darker prose-p:text-[#444] prose-a:text-brand-dark prose-strong:text-brand-darker prose-img:rounded-[15px]">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
