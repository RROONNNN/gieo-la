import type { Metadata } from "next";
import Link from "next/link";
import { RegisterNgoForm } from "@/components/auth/RegisterNgoForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Đăng ký Tổ chức Thiện nguyện",
};

export default function RegisterNgoPage() {
  return (
    <Card>
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
        Đăng ký Tổ chức Thiện nguyện
      </h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Tài khoản sẽ ở trạng thái chờ Admin xác thực sau khi đăng ký
      </p>
      <RegisterNgoForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link
          href="/register"
          className="font-medium text-primary-600 hover:underline"
        >
          ← Chọn loại tài khoản khác
        </Link>
      </p>
    </Card>
  );
}
