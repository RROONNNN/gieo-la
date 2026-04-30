import Link from "next/link";
import { ArrowRight, Shirt, Sparkles, Baby, Watch } from "lucide-react";
import { fetchPosts } from "@/lib/api/posts";
import { fetchNewsList } from "@/lib/api/news";
import { PostCard } from "@/components/posts/PostCard";
import { CategoryCard } from "@/components/posts/CategoryCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsCard } from "@/components/news/NewsCard";

const CATEGORIES = [
  { slug: "do_nam", label: "Đồ Nam", icon: <Shirt className="size-6" /> },
  { slug: "do_nu", label: "Đồ Nữ", icon: <Sparkles className="size-6" /> },
  { slug: "do_tre_em", label: "Đồ Trẻ em", icon: <Baby className="size-6" /> },
  { slug: "phu_kien", label: "Phụ kiện", icon: <Watch className="size-5" /> },
];

export default async function HomePage() {
  let latestPosts: import("@/types/post").Post[] = [];
  let latestNews: import("@/types/news").NewsPost[] = [];
  try {
    const data = await fetchPosts({ limit: 3 });
    latestPosts = data.posts;
  } catch {
    latestPosts = [];
  }

  try {
    const newsData = await fetchNewsList({ limit: 3 });
    latestNews = newsData.items;
  } catch {
    latestNews = [];
  }

  return (
    <div className="flex flex-col gap-24 py-20">
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[500px] overflow-hidden rounded-[24px] bg-brand-dark px-8 py-20 sm:px-16">
        {/* Overlay image placeholder */}
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center mix-blend-overlay opacity-30" />

        <div className="relative z-10 flex max-w-[672px] flex-col gap-8">
          <h1 className="font-heading text-5xl font-bold leading-tight text-white tracking-tight">
            Lá lành đùm lá rách
          </h1>
          <p className="max-w-[576px] text-lg leading-relaxed text-brand-muted">
            Nurturing altruism through community sharing. Find what you need,
            give what you can. Together, we weave a stronger thread of support.
          </p>
          <SearchBar className="max-w-[512px]" />
        </div>
      </section>

      {/* ─── Categories Section ─── */}
      <section className="flex flex-col gap-8">
        <SectionHeading>Danh mục chia sẻ</SectionHeading>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.slug}
              slug={cat.slug}
              label={cat.label}
              icon={cat.icon}
            />
          ))}
        </div>
      </section>

      {/* ─── Latest Posts Section ─── */}
      <section className="flex flex-col gap-8">
        <SectionHeading
          action={
            <Link
              href="/posts"
              className="flex items-center gap-1 text-sm font-medium text-brand-dark hover:underline"
            >
              Xem tất cả
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          Bài đăng mới nhất
        </SectionHeading>

        {latestPosts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-[15px] border border-[var(--border-green)] bg-white p-12 text-center text-muted-foreground">
            Chưa có bài đăng nào. Hãy là người đầu tiên tặng đồ!
          </div>
        )}
      </section>

      {/* ─── News Section ─── */}
      <section className="flex flex-col gap-8">
        <SectionHeading
          action={
            <Link
              href="/news"
              className="flex items-center gap-1 text-sm font-medium text-brand-dark hover:underline"
            >
              Xem tất cả
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          Bản tin cộng đồng
        </SectionHeading>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestNews.map((news) => (
            <NewsCard
              key={news._id}
              id={news._id}
              title={news.title}
              thumbnail={news.thumbnail}
              category={news.category}
              description={news.content.slice(0, 120)}
              publishedAt={news.publishedAt ?? news.createdAt}
              isPinned={news.isPinned}
            />
          ))}
          {latestNews.length === 0 && (
            <p className="col-span-3 py-8 text-center text-sm text-muted-foreground">
              Chưa có bài bản tin nào.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
