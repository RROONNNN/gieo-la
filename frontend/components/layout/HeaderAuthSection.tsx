"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "./UserMenu";
import { Spinner } from "@/components/ui/Spinner";

export function HeaderAuthSection() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner size="sm" className="text-muted-foreground" />;
  }

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        Đăng nhập
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        Đăng ký
      </Link>
    </div>
  );
}
