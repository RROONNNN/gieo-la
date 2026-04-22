import Link from "next/link";
import { Leaf, Search, Gift, Heart, Users, ArrowRight } from "lucide-react";
import { fetchPosts } from "@/lib/api/posts";
import { PostCard } from "@/components/posts/PostCard";

const CATEGORIES = [
  { key: "do_nam", label: "Đồ Nam", icon: "👔" },
  { key: "do_nu", label: "Đồ Nữ", icon: "👗" },
  { key: "do_tre_em", label: "Đồ Trẻ em", icon: "🧸" },
  { key: "phu_kien", label: "Phụ kiện", icon: "🎒" },
];

export default async function HomePage() {
  let latestPosts;
  try {
    const data = await fetchPosts({ limit: 8 });
    latestPosts = data.posts;
  } catch {
    latestPosts = [];
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-200/60 px-4 py-2 text-sm font-medium text-primary-800 dark:bg-primary-800/40 dark:text-primary-200">
              <Leaf className="h-4 w-4" />
              Nền tảng chia sẻ đồ dùng cũ cộng đồng
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Lá lành đùm{" "}
              <span className="text-primary-600">lá rách</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Kết nối người có đồ dùng cũ muốn tặng với người cần nhận.
              Ưu tiên cá nhân khó khăn và tổ chức thiện nguyện.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/posts"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary-600 px-6 text-base font-medium text-white transition-colors hover:bg-primary-700"
              >
                <Search className="h-5 w-5" />
                Tìm đồ dùng
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-6 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Gift className="h-5 w-5" />
                Bắt đầu tặng đồ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="border-b border-border bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
            Danh mục
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={`/posts?category=${cat.key}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-medium text-foreground">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Bài đăng mới nhất
            </h2>
            <Link
              href="/posts"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {latestPosts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latestPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
              Chưa có bài đăng nào. Hãy là người đầu tiên tặng đồ!
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground">
            Cách hoạt động
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Gift,
                title: "1. Đăng bài tặng đồ",
                desc: "Chụp ảnh, mô tả tình trạng đồ dùng và đăng lên nền tảng.",
              },
              {
                icon: Users,
                title: "2. Người cần đăng ký nhận",
                desc: "Cá nhân khó khăn hoặc tổ chức thiện nguyện đã xác thực có thể đăng ký.",
              },
              {
                icon: Heart,
                title: "3. Kết nối & trao đồ",
                desc: "Người tặng chọn người nhận phù hợp và trực tiếp trao đồ.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                  <step.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
