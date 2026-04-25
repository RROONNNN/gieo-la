"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PostGalleryProps {
  images: string[];
  title: string;
}

export function PostGallery({ images, title }: PostGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-[15px] bg-brand-light/30 text-6xl text-brand-muted">
        🍃
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-3 grid-rows-2">
      {/* Main image */}
      <div className="col-span-2 row-span-2 relative aspect-[4/3] overflow-hidden rounded-[15px] bg-brand-light/30">
        <Image
          src={images[selectedIndex]}
          alt={`${title} - ảnh ${selectedIndex + 1}`}
          fill
          className="object-cover"
          sizes="60vw"
          priority
        />
      </div>

      {/* Thumbnail grid */}
      {images.slice(0, 4).map((img, i) => (
        <button
          key={i}
          onClick={() => setSelectedIndex(i)}
          className={cn(
            "relative aspect-square overflow-hidden rounded-[15px] bg-brand-light/30 transition-opacity",
            selectedIndex === i
              ? "ring-2 ring-brand-dark"
              : "opacity-80 hover:opacity-100",
          )}
        >
          <Image
            src={img}
            alt={`${title} - ảnh ${i + 1}`}
            fill
            className="object-cover"
            sizes="20vw"
          />
          {i === 3 && images.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-lg font-semibold text-white">
              +{images.length - 4}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
