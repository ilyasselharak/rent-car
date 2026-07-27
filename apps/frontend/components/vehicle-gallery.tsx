"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VehicleGalleryProps {
  images: string[];
  alt: string;
}

export function VehicleGallery({ images, alt }: VehicleGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightbox, setIsLightbox] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const total = images?.length ?? 0;

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(((index % total) + total) % total);
      setTimeout(() => setIsTransitioning(false), 300);
    },
    [total, isTransitioning]
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightbox) return;
      if (e.key === "Escape") setIsLightbox(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightbox, goNext, goPrev]);

  useEffect(() => {
    if (isLightbox) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isLightbox]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = touch.clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartRef.current;
    if (startX === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const diff = startX - touch.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartRef.current = null;
  };

  const scrollThumbnailIntoView = (index: number) => {
    thumbnailRef.current?.children[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    scrollThumbnailIntoView(index);
  };

  if (!total) return null;

  return (
    <>
      <div className="relative group">
        <div
          className="relative aspect-[16/10] lg:aspect-[16/9] overflow-hidden rounded-xl bg-muted cursor-pointer"
          onClick={() => setIsLightbox(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[currentIndex]!}
            alt={`${alt} - Image ${currentIndex + 1}`}
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              isTransitioning ? "opacity-80" : "opacity-100"
            )}
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
            quality={90}
          />

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

          {total > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full h-10 w-10"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full h-10 w-10"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            {total > 1 && (
              <span className="px-2.5 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium">
                {currentIndex + 1} / {total}
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full h-8 w-8"
            onClick={(e) => { e.stopPropagation(); setIsLightbox(true); }}
            aria-label="Expand image"
          >
            <Expand className="h-4 w-4" />
          </Button>
        </div>

        {total > 1 && (
          <div
            ref={thumbnailRef}
            className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 overflow-x-auto pb-1 scrollbar-thin"
          >
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative flex-shrink-0 w-14 h-11 sm:w-20 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  index === currentIndex
                    ? "border-primary ring-1 ring-primary shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {isLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightbox(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 z-10"
            onClick={() => setIsLightbox(false)}
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="absolute top-4 left-4 text-white/60 text-sm font-medium z-10">
            {currentIndex + 1} / {total}
          </div>

          {total > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 z-10"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 z-10"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex]!}
              alt={`${alt} - Image ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              quality={100}
              priority
            />
          </div>

          {total > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 max-w-[90vw] overflow-x-auto pb-1 px-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); handleThumbnailClick(index); }}
                  className={cn(
                    "relative flex-shrink-0 w-10 h-8 sm:w-16 sm:h-12 rounded-md overflow-hidden border-2 transition-all duration-200",
                    index === currentIndex
                      ? "border-white ring-1 ring-white shadow-lg"
                      : "border-white/30 opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
