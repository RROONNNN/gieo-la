import Link from "next/link";

// const FOOTER_LINKS = [
//   { href: "/privacy", label: "Privacy Policy" },
//   { href: "/terms", label: "Terms of Service" },
//   { href: "/partners", label: "Partner NGOs" },
//   { href: "/contact", label: "Contact Us" },
// ];

// const NGO_LOGOS = ["UNICEF", "Red Cross", "Oxfam", "Save the Children"];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-green)] bg-bg-cream">
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-[70px]">
        {/* Logo */}
        <div className="text-center">
          <Link
            href="/"
            className="font-heading text-2xl font-bold text-brand-dark"
          >
            Lá Lành
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
Chung tay sẻ chia — Cùng nhau vươn lên
          </p>
        </div>

        {/* NGO logos */}
        {/* <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
          {NGO_LOGOS.map((name) => (
            <span
              key={name}
              className="text-sm font-medium text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div> */}

        {/* Links */}
        {/* <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-brand-dark transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div> */}

        {/* Copyright */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} 
        </p>
      </div>
    </footer>
  );
}
