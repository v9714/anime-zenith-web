
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Anime } from "@/services/api";

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

  return (
    <Carousel
      className="w-full"
      opts={{
        align: "start",
        loop: true
      }}
      onSelect={(api) => handleSlideChange(api.selectedScrollSnap())}
    >
      <CarouselContent>
        {animes.map((anime, index) => (
          <CarouselItem key={anime.mal_id} className="relative w-full">
            <div className="relative aspect-[21/9] overflow-hidden">
              <img
                src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="container space-y-4 md:space-y-6">
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
    </Carousel>
  );
}
