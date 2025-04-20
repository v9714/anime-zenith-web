
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Anime } from "@/services/api";
import useEmblaCarousel from 'embla-carousel-react';

interface HeroSliderProps {
  animes: Anime[];
  onSlideChange?: (index: number) => void;
}

export function HeroSlider({ animes, onSlideChange }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (index: number) => {
    setActiveIndex(index);
    onSlideChange?.(index);
  };

  // Auto-slide setup
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % animes.length;
      handleSlideChange(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex, animes.length]);

  return (
    <Carousel
      className="w-full relative group"
      opts={{
        align: "start",
        loop: true
      }}
      onSelect={(api) => {
        if (api && api.scrollSnapList) {
          const currentIndex = api.selectedScrollSnap();
          handleSlideChange(currentIndex);
        }
      }}
    >
      <CarouselContent>
        {animes.map((anime, index) => (
          <CarouselItem key={anime.mal_id} className="relative w-full">
            <div className="relative aspect-[21/9] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/25 to-background/50 mix-blend-overlay z-10" />
              <img
                src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                alt={anime.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="container max-w-[1280px] mx-auto px-4 space-y-4 md:space-y-6">
                  <div className="max-w-[650px] space-y-4">
                    <h1 className={cn(
                      "text-3xl md:text-5xl font-bold font-heading",
                      "animate-fade-in [--animation-delay:200ms]"
                    )}>
                      {anime.title}
                    </h1>
                    <p className={cn(
                      "text-base md:text-lg text-muted-foreground line-clamp-3",
                      "animate-fade-in [--animation-delay:400ms]"
                    )}>
                      {anime.synopsis}
                    </p>
                    <div className={cn(
                      "flex gap-4",
                      "animate-fade-in [--animation-delay:600ms]"
                    )}>
                      <Button asChild size="lg">
                        <Link to={`/anime/${anime.mal_id}`} className="flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Watch Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      <CarouselPrevious className="opacity-0 group-hover:opacity-100 transition-opacity" />
      <CarouselNext className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </Carousel>
  );
}
