import type { Metadata } from "next";
import Link from "next/link";
import { RegisterIndividualForm } from "@/components/auth/RegisterIndividualForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Đăng ký Cá nhân Khó khăn",
};

export default function RegisterIndividualPage() {
  return (
    <Card>
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
        Đăng ký Cá nhân Khó khăn
      </h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Bạn sẽ có quyền ưu tiên nhận đồ sau khi được Admin phê duyệt
      </p>
      <RegisterIndividualForm />
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
