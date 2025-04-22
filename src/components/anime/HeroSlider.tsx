
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
    }, 6000);

    return () => clearInterval(timer);
  }, [activeIndex, animes.length]);

  return (
    <div className="relative w-full min-h-[60vh] md:min-h-[80vh] xl:min-h-[700px] overflow-hidden group">
      <Carousel
        className="w-full h-full"
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setEmblaApi}
      >
        <CarouselContent className="h-full">
          {animes.map((anime, index) => (
            <CarouselItem key={anime.mal_id} className="relative w-full h-full">
              {/* Background image and overlay */}
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                  alt={anime.title}
                  className="w-full h-full object-cover object-center"
                  style={{
                    filter: "brightness(0.65)",
                  }}
                />
                {/* Purple gradient overlay for the right side */}
                <div className="absolute inset-0 bg-gradient-to-l from-[#1A1F2C] via-transparent to-transparent z-20" />
                {/* Top gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/60 to-transparent z-30" />
              </div>
              {/* Content: split into left text and right image */}
              <div className="relative z-40 flex flex-col md:flex-row items-center justify-between h-full max-w-[1440px] mx-auto px-4 xl:px-10 py-12 md:py-20 gap-8">
                {/* LEFT (text) */}
                <div className="flex-1 max-w-xl text-left animate-fade-in bg-transparent">
                  <span className="text-anime-secondary text-base md:text-lg font-semibold">
                    #{index + 1} Spotlight
                  </span>
                  <h1 className="text-white text-3xl md:text-5xl xl:text-6xl font-heading font-bold mt-2 mb-4 drop-shadow-lg leading-tight">{anime.title}</h1>
                  <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-6 line-clamp-4">{anime.synopsis}</p>
                  <div className="flex gap-4">
                    <Button asChild size="lg" className="gap-2 rounded-full bg-anime-secondary hover:bg-anime-accent text-white font-bold">
                      <Link to={`/anime/${anime.mal_id}`}>
                        <Play className="w-5 h-5" />
                        Watch Now
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary" className="gap-2 rounded-full bg-background/80 backdrop-blur border-none">
                      <Link to={`/anime/${anime.mal_id}`}>
                        Detail
                      </Link>
                    </Button>
                  </div>
                </div>
                {/* RIGHT (image with colored shade) */}
                <div className="flex-[1.3] flex items-end justify-center w-full h-[300px] md:h-[460px] xl:h-[600px] relative">
                  <div className="absolute inset-0 z-0 transition-all duration-200 bg-gradient-to-l from-anime-primary/0 via-anime-primary/70 to-anime-dark/90 rounded-3xl pointer-events-none" />
                  <img
                    src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                    alt={anime.title}
                    className="max-h-full max-w-full object-contain object-bottom drop-shadow-2xl m-auto relative z-10 rounded-xl"
                    style={{ filter: "drop-shadow(0 8px 32px #8B5CF6cc)" }}
                  />
                </div>
              </div>
              {/* Next/Prev buttons bottom right */}
              {index === activeIndex && (
                <div className="absolute bottom-8 right-4 md:bottom-10 md:right-12 flex flex-col gap-3 z-50">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollNext}
                    className="rounded-full bg-background/40 hover:bg-background/70 shadow-lg"
                  >
                    <ChevronDown className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollPrev}
                    className="rounded-full bg-background/40 hover:bg-background/70 shadow-lg"
                  >
                    <ChevronUp className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {/* Blur shade at bottom of slider for overlay effect */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background via-background/20 to-transparent z-50 pointer-events-none" />
    </div>
  );
}
