import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfileNotFound() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 flex justify-center">
      <Card className="text-center max-w-sm w-full">
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="text-lg font-semibold text-foreground mb-2">
          Không tìm thấy hồ sơ
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Hồ sơ người dùng này không tồn tại hoặc đã bị xóa.
        </p>
        <Link href="/">
          <Button variant="outline" size="sm">Về trang chủ</Button>
        </Link>
      </Card>
    </main>
  );
}
