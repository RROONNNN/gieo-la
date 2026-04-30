import Link from "next/link";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsAdminActions } from "@/components/admin/NewsAdminActions";
import { adminListNewsServer } from "@/lib/api/adminNews.server";
import { formatDateVN } from "@/lib/utils";
import type { NewsCategory, NewsStatus, NewsPost } from "@/types/news";

const CATEGORY_LABEL: Record<NewsCategory, string> = {
  announcement: "Thông báo",
  story: "Câu chuyện",
  guide: "Hướng dẫn",
  event: "Hoạt động",
};

const STATUS_BADGE: Record<NewsStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Nháp", variant: "default" },
  published: { label: "Đã đăng", variant: "success" },
  hidden: { label: "Ẩn", variant: "warning" },
};

export default async function AdminNewsPage() {
  let items: NewsPost[] = [];
  let total = 0;
  try {
    const result = await adminListNewsServer({ limit: 50 });
    items = result.items;
    total = result.total;
  } catch (e) {
    console.error("[admin/news] adminListNewsServer failed", e);
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <SectionHeading>Quản lý Bản tin</SectionHeading>
          <p className="mt-1 text-sm text-muted-foreground">{total} bài viết</p>
        </div>
        <Link
          href="/admin/news/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-darker transition-colors"
        >
          <Plus className="size-4" />
          Tạo bài mới
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-[15px] border border-[var(--border-green)] bg-white">
        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Chưa có bài viết nào
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border-green)] bg-bg-cream">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-brand-darker">Tiêu đề</th>
                <th className="px-4 py-3 text-left font-medium text-brand-darker">Danh mục</th>
                <th className="px-4 py-3 text-left font-medium text-brand-darker">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-brand-darker">Ngày đăng</th>
                <th className="px-4 py-3 text-right font-medium text-brand-darker">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-green)]">
              {items.map((item) => {
                const st = STATUS_BADGE[item.status];
                return (
                  <tr key={item._id} className="hover:bg-brand-light/10">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.isPinned && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                            Ghim
                          </span>
                        )}
                        <span className="line-clamp-1 font-medium text-brand-darker">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {CATEGORY_LABEL[item.category]}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.publishedAt
                        ? formatDateVN(item.publishedAt)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/news/${item._id}/edit`}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-brand-light/40 hover:text-brand-dark transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        {item.status === "published" && (
                          <Link
                            href={`/news/${item._id}`}
                            target="_blank"
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-brand-light/40 hover:text-brand-dark transition-colors"
                            title="Xem bài"
                          >
                            <ExternalLink className="size-4" />
                          </Link>
                        )}
                        <NewsAdminActions
                          id={item._id}
                          isPinned={item.isPinned}
                          status={item.status}
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
    </div>
  );
}
