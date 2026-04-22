import type { Metadata } from "next";
import { fetchPosts } from "@/lib/api/posts";
import { PostCard } from "@/components/posts/PostCard";
import { PostFilters } from "@/components/posts/PostFilters";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { PostCategory } from "@/types/enums";

export const metadata: Metadata = {
  title: "Diễn đàn",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function PostsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category as PostCategory | undefined;
  const search = params.search || undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const limit = 20;

  let posts: any[];
  let total;

  try {
    const data = await fetchPosts({ category, search, page, limit });
    posts = data.posts;
    total = data.total;
  } catch {
    posts = [];
    total = 0;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Diễn đàn</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tìm đồ dùng cũ cần tặng hoặc đăng bài tặng đồ
          </p>
        </div>
        <Link href="/posts/create">
          <Button>Đăng bài tặng đồ</Button>
        </Link>
      </div>

      <PostFilters currentCategory={category} currentSearch={search} />

      {posts.length > 0 ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total} bài đăng
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/posts?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(search ? { search } : {}),
                      page: String(page - 1),
                    })}`}
                  >
                    <Button size="sm" variant="outline">Trước</Button>
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/posts?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(search ? { search } : {}),
                      page: String(page + 1),
                    })}`}
                  >
                    <Button size="sm" variant="outline">Sau</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Không tìm thấy bài đăng nào phù hợp.
        </div>
      )}
    </div>
  );
}
