"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, FileText, MessageCircle, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

const roleLabelMap: Record<string, string> = {
  [UserRole.MEMBER]: "Thành viên",
  [UserRole.NGO]: "Tổ chức NGO",
  [UserRole.INDIVIDUAL]: "Cá nhân",
  [UserRole.ADMIN]: "Admin",
};

const roleVariantMap: Record<
  string,
  "default" | "success" | "info" | "warning" | "danger"
> = {
  [UserRole.MEMBER]: "default",
  [UserRole.NGO]: "info",
  [UserRole.INDIVIDUAL]: "warning",
  [UserRole.ADMIN]: "danger",
};

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;

  function handleLogout() {
    logout();
    router.replace("/");
    setOpen(false);
  }

  const menuItems = [
    { href: `/profile/${user._id}`, icon: User, label: "Trang cá nhân" },
    { href: "/my-posts", icon: FileText, label: "Bài đăng của tôi" },
    { href: "/messages", icon: MessageCircle, label: "Tin nhắn" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden lg:block text-sm font-medium text-foreground max-w-[120px] truncate">
          {user.name}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-border bg-background shadow-lg z-50">
          {/* User info */}
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="mt-1.5">
              <Badge variant={roleVariantMap[user.role]}>
                {roleLabelMap[user.role]}
              </Badge>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1">
            {menuItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-border p-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
