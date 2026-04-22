import Link from "next/link";
import { Leaf } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { HeaderAuthSection } from "./HeaderAuthSection";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/posts", label: "Diễn đàn" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/news", label: "Bản tin" },
  { href: "/leaderboard", label: "Bảng xếp hạng" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary-600" />
          <span className="text-xl font-bold text-primary-700">Lá Lành</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted hover:text-primary-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2">
          <HeaderAuthSection />
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </header>
  );
}
