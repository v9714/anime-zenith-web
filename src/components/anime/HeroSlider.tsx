
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
    <section
      className="relative w-full min-h-[100svh] h-screen md:min-h-[80vh] xl:min-h-[700px] overflow-hidden flex items-center bg-black"
      style={{
        transition: "background-color 0.5s"
      }}
    >
      <Carousel
        className="absolute inset-0 w-full h-full"
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setEmblaApi}
      >
        <CarouselContent className="h-full">
          {animes.map((anime, index) => (
            <CarouselItem key={anime.mal_id} className="relative w-full h-full">
              {/* Full BG image */}
              <img
                src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                alt={anime.title}
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
                style={{ filter: "brightness(0.5) saturate(1.25)", zIndex: 1 }}
                draggable={false}
                loading="eager"
              />
              {/* Color overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#14072d]/90 via-[#5227c8]/40 to-transparent z-10" />
              {/* Left-Right fade */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#151531] via-transparent to-[#74257499] z-20" />
              {/* Responsive content grid */}
              <div className="relative z-30 flex flex-col-reverse items-center md:flex-row h-full max-w-[1440px] mx-auto px-2 sm:px-8 xl:px-20 py-14 md:py-24 gap-8 animate-fade-in">
                {/* LEFT (Text, on top of dark gradient) */}
                <div className="flex-1 flex flex-col items-start justify-center min-w-[260px] max-w-[540px] bg-black/10 rounded-2xl p-5 sm:p-8 md:p-10 backdrop-blur-sm shadow-xl text-left border border-white/5"
                  style={{ background: 'linear-gradient(120deg, #23152A 68%, #4B5672b0 100%)' }}>
                  <span className="text-anime-secondary text-base md:text-lg font-bold drop-shadow animate-fade-in">
                    #{index + 1} Spotlight
                  </span>
                  <h1 className="text-white text-3xl md:text-5xl xl:text-6xl font-heading font-bold my-3 drop-shadow-lg leading-tight animate-fade-in">
                    {anime.title}
                  </h1>
                  <p className="text-base md:text-lg text-slate-100/80 max-w-lg mb-7 line-clamp-4">{anime.synopsis}</p>
                  <div className="flex gap-4 mt-2">
                    <Button asChild size="lg" className="gap-2 rounded-full bg-anime-secondary hover:bg-anime-accent text-white font-bold shadow-xl">
                      <Link to={`/anime/${anime.mal_id}`}>
                        <Play className="w-5 h-5" />
                        Watch Now
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary" className="gap-2 rounded-full bg-background/90 backdrop-blur border-none font-bold shadow-lg">
                      <Link to={`/anime/${anime.mal_id}`}>Detail</Link>
                    </Button>
                  </div>
                </div>
                {/* RIGHT (Giant Image w/ shade) */}
                <div className="flex-[1.4] relative h-[340px] md:h-[520px] xl:h-[730px] w-full max-w-[410px] sm:max-w-[520px] md:max-w-[520px] xl:max-w-[600px] mx-auto flex items-end justify-center">
                  <div
                    className="absolute inset-0 rounded-3xl z-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 70% 70%, rgba(200,102,246,0.41) 0%, rgba(26,31,44,0.91) 73%)"
                    }}
                  />
                  <img
                    src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                    alt={anime.title}
                    className="max-h-full max-w-full object-contain object-bottom m-auto relative z-10 rounded-3xl shadow-2xl animate-fade-in"
                    style={{
                      boxShadow: "0 15px 45px 10px #a682ea80, 0 4px 45px 14px #0b051077",
                      filter: "drop-shadow(0 8px 38px #8B5CF6dd) saturate(1.2)",
                      aspectRatio: "3/4",
                      border: "6px solid rgba(255,255,255,0.05)"
                    }}
                    draggable={false}
                  />
                </div>
              </div>
              {/* Next/Prev bottom right */}
              {index === activeIndex && (
                <div className="absolute bottom-9 right-6 md:bottom-12 md:right-16 flex flex-col gap-3 z-50 animate-fade-in">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollNext}
                    className="rounded-full bg-background/40 hover:bg-background/70 shadow-xl border-2 border-anime-secondary transition"
                    aria-label="Next"
                  >
                    <ChevronDown className="h-7 w-7" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollPrev}
                    className="rounded-full bg-background/40 hover:bg-background/70 shadow-xl border-2 border-anime-secondary transition"
                    aria-label="Previous"
                  >
                    <ChevronUp className="h-7 w-7" />
                  </Button>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {/* Responsive bottom shade for overlay */}
      <div className="absolute bottom-0 left-0 w-full h-16 md:h-40 bg-gradient-to-t from-background via-background/50 to-transparent z-40 pointer-events-none" />
    </section>
  );
}
