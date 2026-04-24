import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ProfileNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 flex justify-center">
      <div className="w-full max-w-sm rounded-[15px] border border-[var(--border-green)] bg-white p-8 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="text-lg font-semibold text-brand-darker mb-2">
          Không tìm thấy hồ sơ
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Hồ sơ người dùng này không tồn tại hoặc đã bị xóa.
        </p>
        <Link href="/">
          <Button variant="outline" size="sm">Về trang chủ</Button>
        </Link>
      </div>
    </main>
  );
}
