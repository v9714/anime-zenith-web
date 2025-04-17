
import { useState, useRef, useCallback } from "react";
import { Anime } from "@/services/api";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimeCard } from "./AnimeCard";

interface AnimeCarouselProps {
  title: string;
  animes: Anime[];
  link?: string;
}

export function AnimeCarousel({ title, animes, link }: AnimeCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.75;
    const newScrollLeft = direction === "left" 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  }, []);

  return (
    <section className="py-6">
      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold">{title}</h2>
          {link && (
            <a href={link} className="text-sm text-primary hover:underline">
              View All
            </a>
          )}
        </div>
        
        <div className="relative">
          {showLeftArrow && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/70 backdrop-blur rounded-full h-10 w-10 shadow-md border"
              onClick={() => scroll("left")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Scroll left</span>
            </Button>
          )}
          
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-none gap-4 pb-4"
            onScroll={handleScroll}
          >
            {animes.map((anime) => (
              <AnimeCard
                key={anime.mal_id}
                anime={anime}
                className="min-w-[170px] sm:min-w-[180px] md:min-w-[200px] lg:min-w-[220px] flex-shrink-0"
              />
            ))}
          </div>
          
          {showRightArrow && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/70 backdrop-blur rounded-full h-10 w-10 shadow-md border"
              onClick={() => scroll("right")}
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Scroll right</span>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
