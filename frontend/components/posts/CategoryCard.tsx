import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  slug: string;
  label: string;
  image?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function CategoryCard({
  slug,
  label,
  image,
  icon,
  className,
}: CategoryCardProps) {
  return (
    <Link
      href={`/posts?category=${slug}`}
      className={cn(
        "group relative flex flex-col items-start justify-end overflow-hidden rounded-[15px] border border-[var(--border-green)] bg-brand-light p-6 transition-transform hover:scale-[1.02]",
        "h-[255px]",
        className,
      )}
    >
      {/* Background image */}
      {image && (
        <div className="absolute inset-0 opacity-60">
          <Image
            src={image}
            alt={label}
            fill
            className="object-cover"
            sizes="25vw"
          />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(22,56,33,0.8)] to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-2">
        {icon && <div className="text-white">{icon}</div>}
        <h3 className="font-heading text-2xl font-semibold text-white">
          {label}
        </h3>
      </div>
    </Link>
  );
}
