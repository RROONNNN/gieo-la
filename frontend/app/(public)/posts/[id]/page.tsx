import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, User, Calendar, Package } from "lucide-react";
import { fetchPost } from "@/lib/api/posts";
import { fetchApplications } from "@/lib/api/applications";
import { Badge } from "@/components/ui/Badge";
import { formatDateVN } from "@/lib/utils";
import { CATEGORY_LABEL, CONDITION_LABEL, STATUS_LABEL, STATUS_VARIANT } from "@/lib/postLabels";
import { getCurrentUserFromCookie } from "@/lib/auth/server";
import { PostActions } from "@/components/posts/PostActions";
import { ApplicationPanel } from "@/components/posts/ApplicationPanel";
import type { Application } from "@/types/application";

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

  let applications: Application[];
  try {
    applications = await fetchApplications(id);
  } catch {
    applications = [];
  }

  const viewer = await getCurrentUserFromCookie();
  const isAuthor = viewer !== null && viewer._id === (typeof post.author === "string" ? post.author : post.author._id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Image gallery */}
      <div className="mb-6 grid gap-2 sm:grid-cols-2">
        {post.images.map((img, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-xl bg-muted ${
              i === 0 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
            }`}
          >
            <Image
              src={img}
              alt={`${post.title} - ảnh ${i + 1}`}
              fill
              className="object-cover"
              sizes={i === 0 ? "100vw" : "50vw"}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {post.isPinned && (
                <Badge variant="warning">Ghim</Badge>
              )}
              <Badge variant={STATUS_VARIANT[post.status] ?? "default"}>
                {STATUS_LABEL[post.status]}
              </Badge>
              <Badge variant="info">{CATEGORY_LABEL[post.category]}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Số lượng: <strong className="text-foreground">{post.quantity}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Tình trạng: <strong className="text-foreground">{CONDITION_LABEL[post.condition]}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{post.location?.city || "Hà Nội"}{post.location?.district ? `, ${post.location.district}` : ""}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDateVN(post.createdAt)}</span>
            </div>
          </div>

          {post.conditionNote && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 font-medium text-foreground">Ghi chú tình trạng</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.conditionNote}</p>
            </div>
          )}

          {post.description && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 font-medium text-foreground">Mô tả</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.description}</p>
            </div>
          )}

          {/* Author info */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 font-medium text-foreground">Người đăng</h3>
            {typeof post.author !== "string" && (
              <Link href={`/profile/${post.author._id}`} className="flex items-center gap-3 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                  {post.author.avatar ? (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary-600">
                    {post.author.name}
                    {post.author.role === "ngo" && (
                      <span className="ml-1.5 text-blue-500" title="NGO Xác thực">✓</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{post.author.role}</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar: Actions & Applications */}
        <div className="space-y-4">
          <PostActions post={post} isAuthor={isAuthor} viewerRole={viewer?.role ?? null} />
          <ApplicationPanel
            postId={post._id}
            postStatus={post.status}
            applications={applications}
            isAuthor={isAuthor}
            viewerRole={viewer?.role ?? null}
            viewerId={viewer?._id ?? null}
          />
        </div>
      </div>
    </div>
  );
}
