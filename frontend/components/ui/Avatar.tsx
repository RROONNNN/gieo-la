import { cn } from "@/lib/utils";
import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  showOnline?: boolean;
  className?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-14",
  xl: "size-20",
};

const textSizes: Record<AvatarSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-2xl",
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  src,
  alt = "",
  size = "md",
  showOnline = false,
  className,
}: AvatarProps) {
  const px = sizeMap[size];

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={px}
          height={px}
          className={cn(
            "rounded-full object-cover",
            sizeClasses[size],
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-brand-light text-brand-dark font-semibold",
            sizeClasses[size],
            textSizes[size],
          )}
        >
          {getInitials(alt)}
        </div>
      )}
      {showOnline && (
        <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-green-500" />
      )}
    </div>
  );
}
