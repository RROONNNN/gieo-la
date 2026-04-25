"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/enums";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/posts", label: "Diễn đàn" },
  { href: "/news", label: "Tin tức" },
  { href: "/leaderboard", label: "Bảng xếp hạng" },
];


export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setDropdownOpen(false);
    router.push("/");
  }

   function _getNavLinks(role?: UserRole) {
    if (!role || role === UserRole.ADMIN || role === UserRole.NGO) {
      return [
        ...NAV_LINKS,
  { href: "/wishlist", label: "Wishlist" },

      ];
    }
    return NAV_LINKS;
  }
  
  return (
    <nav className="sticky top-0 z-50 bg-brand-dark">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:px-[70px]">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-white"
        >
          Lá Lành
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {_getNavLinks(user?.role).map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "text-white border-b-2 border-white pb-0.5"
                    : "text-white/70 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <User className="size-5" />
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className={cn("size-4 transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 z-50">
                  <Link
                    href={`/profile/${user._id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="size-4" />
                    Trang cá nhân
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="size-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              <User className="size-4" />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
