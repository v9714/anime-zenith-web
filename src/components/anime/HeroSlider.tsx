import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, ChevronUp, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Anime } from "@/services/api";

interface HeroSliderProps {
  animes: Anime[];
  onSlideChange?: (index: number) => void;
}

export function HeroSlider({ animes, onSlideChange }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaApi, setEmblaApi] = useState<any>(null);

  const handleSlideChange = (index: number) => {
    setActiveIndex(index);
    onSlideChange?.(index);
  };

  const scrollPrev = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      const prevIndex = (activeIndex - 1 + animes.length) % animes.length;
      handleSlideChange(prevIndex);
    }
  };

  const scrollNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
      const nextIndex = (activeIndex + 1) % animes.length;
      handleSlideChange(nextIndex);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      scrollNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex, animes.length]);

  return (
    <div className="relative w-full group">
      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setEmblaApi}
      >
        <CarouselContent>
          {animes.map((anime, index) => (
            <CarouselItem key={anime.mal_id} className="relative w-full">
              <div className="relative aspect-[21/9] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
                
                <img
                  src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                  alt={anime.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 flex items-center z-20">
                  <div className="container max-w-[1280px] mx-auto px-4">
                    <div className="max-w-[650px] space-y-6">
                      <span className={cn(
                        "text-primary font-semibold",
                        "animate-fade-in [--animation-delay:200ms]"
                      )}>
                        #{index + 1} Spotlight
                      </span>
                      <h1 className={cn(
                        "text-4xl md:text-6xl font-bold font-heading leading-tight",
                        "animate-fade-in [--animation-delay:400ms]"
                      )}>
                        {anime.title}
                      </h1>
                      <p className={cn(
                        "text-base md:text-lg text-muted-foreground line-clamp-3",
                        "animate-fade-in [--animation-delay:600ms]"
                      )}>
                        {anime.synopsis}
                      </p>
                      <div className={cn(
                        "flex gap-4",
                        "animate-fade-in [--animation-delay:800ms]"
                      )}>
                        <Button asChild size="lg" className="gap-2">
                          <Link to={`/anime/${anime.mal_id}`}>
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

        <div className="absolute right-4 md:right-8 bottom-8 flex gap-2 z-30">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </Carousel>
    </div>
  );
}
