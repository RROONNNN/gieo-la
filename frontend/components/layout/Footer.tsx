import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* NGO Logos Section */}
        <div className="mb-6">
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            Đối tác thiện nguyện
          </p>
          <div className="flex items-center justify-center gap-8 overflow-x-auto py-2">
            {/* Placeholder for NGO logos — will be populated later */}
            <div className="h-10 w-24 rounded bg-muted animate-pulse" />
            <div className="h-10 w-24 rounded bg-muted animate-pulse" />
            <div className="h-10 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4 text-primary-600" />
            <span>&copy; {new Date().getFullYear()} Lá Lành. Tất cả quyền được bảo lưu.</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Nền tảng chia sẻ đồ dùng cũ cộng đồng
          </p>
        </div>
      </div>
    </footer>
  );
}
