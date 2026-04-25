import { Suspense } from "react";
import Link from "next/link";
import { Pin, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AdminPostFilters } from "@/components/admin/AdminPostFilters";
import { AdminPostActions } from "@/components/admin/AdminPostActions";
import { listAdminPostsServer } from "@/lib/api/adminPosts.server";
import { formatDateVN } from "@/lib/utils";
import { CATEGORY_LABEL, STATUS_LABEL, STATUS_VARIANT } from "@/lib/postLabels";
import type { Post } from "@/types/post";

interface AdminPostsPageProps {
  searchParams: Promise<{
    status?: string;
    category?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}

export default async function AdminPostsPage({
  searchParams,
}: AdminPostsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const limit = 20;

  let posts: Post[] = [];
  let total = 0;
  try {
    const result = await listAdminPostsServer({
      status: params.status,
      category: params.category,
      search: params.search,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      page,
      limit,
    });
    posts = result.posts ?? [];
    total = result.total ?? 0;
  } catch (error) {
    console.error("[admin/posts] listAdminPostsServer failed", error);
  }

  const buildPageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (params.status) sp.set("status", params.status);
    if (params.category) sp.set("category", params.category);
    if (params.search) sp.set("search", params.search);
    if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
    if (params.dateTo) sp.set("dateTo", params.dateTo);
    if (p > 1) sp.set("page", String(p));
    return `/admin/posts${sp.size > 0 ? `?${sp}` : ""}`;
  };

  return (
    <div className="p-8">
      <SectionHeading>Quản lý bài đăng</SectionHeading>
      <p className="mt-1 text-sm text-muted-foreground">{total} bài đăng</p>

      {/* Filter bar + Table */}
      <div className="mt-6 overflow-hidden rounded-[15px] border border-[var(--border-green)] bg-white">
        <Suspense fallback={null}>
          <AdminPostFilters />
        </Suspense>

        {posts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Không có bài đăng nào
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border-green)] bg-bg-cream">
              <tr>
                <th className="w-14 px-4 py-3 text-left font-medium text-brand-darker">
                  Ảnh
                </th>
                <th className="px-4 py-3 text-left font-medium text-brand-darker">
                  Bài đăng
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-brand-darker md:table-cell">
                  Người đăng
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-brand-darker lg:table-cell">
                  Danh mục
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-brand-darker lg:table-cell">
                  Trạng thái
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-brand-darker xl:table-cell">
                  Ngày đăng
                </th>
                <th className="px-4 py-3 text-right font-medium text-brand-darker">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-green)]">
              {posts.map((post) => {
                const author =
                  typeof post.author === "string" ? null : post.author;
                const firstImage = post.images?.[0] ?? null;
                return (
                  <tr key={post._id} className="hover:bg-bg-cream/50">
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      {firstImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={firstImage}
                          alt={post.title}
                          className="size-12 rounded-lg object-cover border border-[var(--border-green)] shrink-0"
                        />
                      ) : (
                        <div className="size-12 rounded-lg bg-bg-cream border border-[var(--border-green)] flex items-center justify-center text-muted-foreground text-xs shrink-0">
                          —
                        </div>
                      )}
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {post.isPinned && (
                          <Pin className="size-3 text-amber-500 shrink-0" />
                        )}
                        <p className="font-medium text-brand-darker max-w-[180px] truncate">
                          {post.title}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        SL: {post.quantity}
                      </p>
                    </td>

                    {/* Author */}
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar src={author?.avatar} alt={author?.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-brand-darker max-w-[120px]">
                            {author?.name ?? "—"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground max-w-[120px]">
                            {(author as (typeof author & { email?: string }))?.email ?? ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <Badge variant="category">
                        {CATEGORY_LABEL[post.category] ?? post.category}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <Badge variant={STATUS_VARIANT[post.status] ?? "default"}>
                        {STATUS_LABEL[post.status] ?? post.status}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                      {formatDateVN(post.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/posts/${post._id}`}
                          target="_blank"
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-bg-cream hover:text-brand-dark transition-colors"
                          title="Xem bài đăng"
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                        <AdminPostActions
                          postId={post._id}
                          isPinned={post.isPinned}
                          status={post.status}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildPageHref(page - 1)}
                className="rounded-lg border border-[var(--border-green)] bg-white px-3 py-1.5 hover:bg-bg-cream transition-colors"
              >
                Trước
              </Link>
            )}
            {page * limit < total && (
              <Link
                href={buildPageHref(page + 1)}
                className="rounded-lg border border-[var(--border-green)] bg-white px-3 py-1.5 hover:bg-bg-cream transition-colors"
              >
                Sau
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
