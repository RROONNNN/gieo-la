import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Share2, Bookmark, ChevronRight } from "lucide-react";
import { fetchPost } from "@/lib/api/posts";
import { fetchApplications } from "@/lib/api/applications";
import { fetchComments } from "@/lib/api/comments";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { PostGallery } from "@/components/posts/PostGallery";
import { PostStats } from "@/components/posts/PostStats";
import { ApplicationPanel } from "@/components/posts/ApplicationPanel";
import { PostOwnerActions } from "@/components/posts/PostOwnerActions";
import { CommentSection } from "@/components/posts/CommentSection";
import { formatRelativeTimeVN } from "@/lib/utils";
import { CATEGORY_LABEL, STATUS_LABEL, STATUS_VARIANT } from "@/lib/postLabels";
import { getCurrentUserFromCookie } from "@/lib/auth/server";
import type { Application } from "@/types/application";
import type { PostComment } from "@/types/comment";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  let post;
  try {
    post = await fetchPost(id);
  } catch {
    notFound();
  }

  const [applications, initialComments, viewer] = await Promise.all([
    fetchApplications(id).catch((): Application[] => []),
    fetchComments(id).catch((): PostComment[] => []),
    getCurrentUserFromCookie(),
  ]);

  const author = typeof post.author === "string" ? null : post.author;
  const authorId = author?._id || (typeof post.author === "string" ? post.author : "");
  const isAuthor = viewer !== null && viewer._id === authorId;

  return (
    <div className="py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/posts" className="hover:text-brand-dark">
          Diễn đàn
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-brand-darker">
          {CATEGORY_LABEL[post.category] || post.category}
        </span>
        {post.location?.city && (
          <>
            <ChevronRight className="size-3" />
            <span className="text-brand-darker">{post.location.city}</span>
          </>
        )}
      </nav>

      {/* Title + author row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {post.isPinned && <Badge variant="pinned">Ghim</Badge>}
            <Badge variant={STATUS_VARIANT[post.status] ?? "default"}>
              {STATUS_LABEL[post.status]}
            </Badge>
          </div>
          <h1 className="font-heading text-3xl font-bold text-brand-darker">
            {post.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex size-10 items-center justify-center rounded-full border border-[var(--border-green)] text-muted-foreground hover:text-brand-dark transition-colors">
            <Share2 className="size-5" />
          </button>
          <button className="flex size-10 items-center justify-center rounded-full border border-[var(--border-green)] text-muted-foreground hover:text-brand-dark transition-colors">
            <Bookmark className="size-5" />
          </button>
        </div>
      </div>

      {/* Author info */}
      {author && (
        <Link
          href={`/profile/${author._id}`}
          className="mb-8 inline-flex items-center gap-3 group"
        >
          <Avatar src={author.avatar} alt={author.name} size="md" showOnline />
          <div>
            <p className="text-sm font-medium text-brand-darker group-hover:underline">
              {author.name}
              {author.role === "ngo" && (
                <span className="ml-1 text-blue-500" title="NGO Xác thực">
                  ✓
                </span>
              )}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {post.location?.city || "Hà Nội"} &middot;{" "}
              Đăng {formatRelativeTimeVN(post.createdAt)}
            </p>
          </div>
        </Link>
      )}

      {/* 2-column layout */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main content */}
        <div className="flex-1 space-y-8">
          {/* Gallery */}
          <PostGallery images={post.images} title={post.title} />

          {/* Stats */}
          <PostStats
            quantity={post.quantity}
            condition={post.condition}
            category={post.category}
          />

          {/* Description */}
          {post.description && (
            <div>
              <h2 className="mb-3 font-heading text-xl font-semibold text-brand-darker">
                Câu chuyện chia sẻ
              </h2>
              <div className="rounded-[15px] border border-[var(--border-green)] bg-white p-6">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>
            </div>
          )}

          {post.conditionNote && (
            <div className="rounded-[15px] border border-[var(--border-green)] bg-white p-6">
              <h3 className="mb-2 font-medium text-brand-darker">
                Ghi chú tình trạng
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {post.conditionNote}
              </p>
            </div>
          )}

          {/* Comments */}
          <CommentSection postId={post._id} initialComments={initialComments} />
        </div>

        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-[350px] lg:self-start space-y-4">
          <PostOwnerActions
            postId={post._id}
            postStatus={post.status}
            isAuthor={isAuthor}
          />
          <ApplicationPanel
            postId={post._id}
            postStatus={post.status}
            postAuthorId={authorId}
            applications={applications}
          />
        </aside>
      </div>
    </div>
  );
}
