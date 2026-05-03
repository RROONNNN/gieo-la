"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  FileText,
  Newspaper,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";

const ADMIN_NAV = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/posts", label: "Bài đăng", icon: FileText },
  { href: "/admin/verifications", label: "Xác thực", icon: ShieldCheck },
  { href: "/admin/news", label: "Bản tin", icon: Newspaper },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-[var(--border-green)] bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link
          href="/admin"
          className="font-heading text-2xl font-bold text-brand-dark"
        >
          Lá Lành
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {ADMIN_NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-light text-brand-dark"
                  : "text-muted-foreground hover:bg-brand-light/30 hover:text-brand-dark",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin user */}
      <div className="border-t border-[var(--border-green)] p-4">
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} alt={user?.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-brand-darker">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs text-muted-foreground">System Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
