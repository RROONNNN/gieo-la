import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPosts, fetchMyPostsServer } from "@/lib/api/posts";
import { getTokenFromCookie, getCurrentUserFromCookie } from "@/lib/auth/server";
import { PostCard } from "@/components/posts/PostCard";
import { PostFilters } from "@/components/posts/PostFilters";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { PostCategory } from "@/types/enums";
import { Post } from "@/types/post";

export const metadata: Metadata = {
  title: "Diễn đàn",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    search?: string;
    city?: string;
    page?: string;
    mine?: string;
  }>;
}

export default async function PostsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category as PostCategory | undefined;
  const status = params.status as import("@/types/enums").PostStatus | undefined;
  const search = params.search || undefined;
  const city = params.city || undefined;
  const mine = params.mine === "true";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const limit = 12;

  const [viewer, token] = await Promise.all([
    getCurrentUserFromCookie(),
    getTokenFromCookie(),
  ]);
  const isAuthenticated = viewer !== null;

  let posts: Post[];
  let total;

  try {
    if (mine && token) {
      const data = await fetchMyPostsServer(token, { category, status, search, page, limit });
      posts = data.posts;
      total = data.total;
    } else {
      const data = await fetchPosts({ category, status, search, city, page, limit });
      posts = data.posts;
      total = data.total;
    }
  } catch {
    posts = [];
    total = 0;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold text-brand-darker">
            Cộng đồng cho tặng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} bài đăng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/posts/create">
            <Button>Đăng bài tặng đồ</Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-xl">
        <SearchBar defaultValue={search} />
      </div>

      {/* 2-column layout */}
      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden w-[220px] shrink-0 lg:block">
          <Suspense fallback={null}>
            <PostFilters
              currentCategory={category}
              currentSearch={search}
              isAuthenticated={isAuthenticated}
              isMine={mine}
            />
          </Suspense>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {posts.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {/* Load more */}
              {page < totalPages && (
                <div className="mt-10 text-center">
                  <Link
                    href={`/posts?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(search ? { search } : {}),
                      page: String(page + 1),
                    })}`}
                  >
                    <Button variant="outline" size="lg">
                      Tải thêm bài đăng
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[15px] border border-[var(--border-green)] bg-white p-12 text-center text-muted-foreground">
              Không tìm thấy bài đăng nào phù hợp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
