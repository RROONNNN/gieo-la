import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchNewsList } from "@/lib/api/news";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsFilters } from "@/components/news/NewsFilters";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { NewsCategory } from "@/types/news";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Bản tin cộng đồng — Lá Lành",
  description: "Các bài viết thông tin, câu chuyện cảm hứng và hoạt động cộng đồng từ Ban quản trị Lá Lành.",
};

export default async function NewsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const category = sp.category as NewsCategory | undefined;

  const data = await fetchNewsList({ category, page, limit: 12 }).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    limit: 12,
  }));

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div className="py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-brand-darker">
          Bản tin cộng đồng
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Thông tin, câu chuyện và hoạt động từ Ban quản trị Lá Lành
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Suspense>
          <NewsFilters />
        </Suspense>
      </div>

      {/* Grid */}
      {data.items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((post) => (
            <NewsCard
              key={post._id}
              id={post._id}
              title={post.title}
              thumbnail={post.thumbnail}
              category={post.category}
              description={post.content.slice(0, 120)}
              publishedAt={post.publishedAt ?? post.createdAt}
              isPinned={post.isPinned}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[15px] border border-[var(--border-green)] bg-white p-16 text-center text-muted-foreground">
          Chưa có bài viết nào.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (category) params.set("category", category);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/news?${params.toString()}`}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  p === page
                    ? "border-brand-dark bg-brand-dark text-white"
                    : "border-[var(--border-green)] bg-white text-brand-darker hover:bg-brand-light/40"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
