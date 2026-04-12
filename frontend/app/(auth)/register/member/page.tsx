import type { Metadata } from "next";
import Link from "next/link";
import { RegisterMemberForm } from "@/components/auth/RegisterMemberForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Đăng ký Thành viên",
};

export default function RegisterMemberPage() {
  return (
    <Card>
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
        Đăng ký Thành viên
      </h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Tham gia cộng đồng "Lá Lành" và bắt đầu tặng đồ
      </p>
      <RegisterMemberForm />
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
