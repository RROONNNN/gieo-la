import { redirect } from "next/navigation";
import { CreateWishlistForm } from "@/components/wishlist/CreateWishlistForm";
import { getCurrentUserFromCookie } from "@/lib/auth/server";

export default async function CreateWishlistPage() {
  const viewer = await getCurrentUserFromCookie();
  if (!viewer) redirect("/login");

  return (
    <div className="py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-brand-darker">Đăng Wishlist</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Chia sẻ nhu cầu của tổ chức để cộng đồng hỗ trợ
          </p>
        </div>
        <div className="rounded-[15px] border border-[var(--border-green)] bg-white p-8">
          <CreateWishlistForm />
        </div>
      </div>
    </div>
  );
}
