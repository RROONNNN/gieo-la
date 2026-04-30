import { NewsForm } from "@/components/admin/NewsForm";

export const metadata = {
  title: "Tạo bài bản tin — Admin",
};

export default function AdminNewsNewPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-darker">
        Tạo bài bản tin mới
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Bài sẽ xuất hiện trên trang Bản tin cộng đồng khi được đăng.
      </p>
      <div className="mt-8 max-w-3xl">
        <NewsForm />
      </div>
    </div>
  );
}
