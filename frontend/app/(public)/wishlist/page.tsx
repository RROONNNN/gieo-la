import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { fetchWishlist } from "@/lib/api/wishlist";
import { WishlistCard } from "@/components/wishlist/WishlistCard";
import { WishlistFilters } from "@/components/wishlist/WishlistFilters";
import { getCurrentUserFromCookie } from "@/lib/auth/server";
import type { PostCategory } from "@/types/enums";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function WishlistPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;

  const [data, viewer] = await Promise.all([
    fetchWishlist({
      category: sp.category as PostCategory | undefined,
      status: sp.status as "open" | "fulfilled" | undefined,
      page,
    }).catch(() => ({ items: [], total: 0, page: 1, limit: 12 })),
    getCurrentUserFromCookie(),
  ]);

  const canCreate =
    viewer !== null;
  // Note: actual NGO+ngo_verified check is enforced by backend; 
  // we show button for any logged-in user, backend returns 403 if not NGO verified.

  return (
    <div className="py-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brand-darker">Wishlist NGO</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Danh sách vật phẩm các tổ chức NGO đang cần
          </p>
        </div>
        {canCreate && (
          <Link
            href="/wishlist/create"
            className="inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-darker transition-colors"
          >
            <Plus className="size-4" />
            Đăng Wishlist
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <WishlistFilters />
        </Suspense>
      </div>

      {/* Grid */}
      {data.items.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">Không có wishlist nào</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((item) => (
            <WishlistCard key={item._id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.total > data.limit && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: Math.ceil(data.total / data.limit) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/wishlist?${new URLSearchParams({ ...(sp.category ? { category: sp.category } : {}), ...(sp.status ? { status: sp.status } : {}), page: String(p) })}`}
              className={`flex size-9 items-center justify-center rounded-full border text-sm transition-colors ${
                p === page
                  ? "border-brand-dark bg-brand-dark text-white"
                  : "border-[var(--border-green)] text-brand-dark hover:bg-[var(--brand-light)]"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
