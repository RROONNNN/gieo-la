import type { Metadata } from "next";
import Link from "next/link";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { Card } from "@/components/ui/Card";


export const metadata: Metadata = {
  title: "Đăng ký",
};

export default function RegisterPage() {
  return (
    <Card>
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
        Tạo tài khoản
      </h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Chọn loại tài khoản phù hợp với bạn
      </p>
      <RoleSelector />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </Card>
  );
}
