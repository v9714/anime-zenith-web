
import { useState, useEffect, useCallback, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Anime } from "@/services/api";
import { cn } from "@/lib/utils";

// Animation helpers (could be separated later!)
const fadeIn = "animate-fade-in transition-[opacity,transform] duration-500";

// Responsive: left glass + right image half
// Background is fullscreen, details on left 50%
interface HeroSliderProps {
  animes: Anime[];
  onSlideChange?: (index: number) => void;
}

export function HeroSlider({ animes, onSlideChange }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaApi, setEmblaApi] = useState<any>(null);
  const [autoplay, setAutoplay] = useState(true);
  const [progress, setProgress] = useState(0);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoplayDuration = 6000;
  const progressStepMs = 50;

  // Set active/handle slide
  const handleSlideChange = useCallback((index: number) => {
    setActiveIndex(index);
    onSlideChange?.(index);
  }, [onSlideChange]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
      handleSlideChange(index);
      resetAutoplay();
    }
  }, [emblaApi, handleSlideChange]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      const prevIndex = (activeIndex - 1 + animes.length) % animes.length;
      handleSlideChange(prevIndex);
      resetAutoplay();
    }
  }, [emblaApi, activeIndex, animes.length, handleSlideChange]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      const nextIndex = (activeIndex + 1) % animes.length;
      handleSlideChange(nextIndex);
      resetAutoplay();
    }
  }, [emblaApi, activeIndex, animes.length, handleSlideChange]);

  const resetAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgress(0);
    if (autoplay) {
      let progressValue = 0;
      progressIntervalRef.current = setInterval(() => {
        progressValue += (progressStepMs / autoplayDuration) * 100;
        setProgress(Math.min(progressValue, 100));
      }, progressStepMs);

      autoplayTimerRef.current = setTimeout(scrollNext, autoplayDuration);
    }
  }, [autoplay, scrollNext]);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [autoplay, activeIndex, resetAutoplay]);

  const toggleAutoplay = () => setAutoplay(prev => !prev);

  const currentAnime = animes[activeIndex];

  return (
    <section
      className={cn(
        "relative w-full h-[80vh] min-h-[400px] flex items-stretch overflow-hidden",
        "bg-black"
      )}
      style={{
        // Use the current anime image in the background, blurred and covered
        backgroundImage: currentAnime
          ? `url(${currentAnime.images?.webp?.large_image_url || currentAnime.images?.jpg?.large_image_url})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-anime-primary/80 to-black/40 pointer-events-none transition-all"></div>
      {/* Slide transition area (full screen) */}
      <Carousel
        className="relative w-full h-full"
        opts={{
          align: "start",
          loop: true,
          dragFree: false,
        }}
        setApi={setEmblaApi}
      >
        <CarouselContent className="h-full">
          {animes.map((anime, index) => (
            <CarouselItem key={anime.mal_id} className="w-full h-full">
              {/* Responsive: details on left, right is mostly background */}
              <div className="flex flex-row h-full w-full">
                {/* Left: Glassmorphism panel */}
                <div
                  className={cn(
                    "relative z-10 flex flex-col justify-center items-start",
                    "w-full sm:w-4/5 md:w-1/2 h-full max-h-full p-6 sm:p-12 md:p-16 backdrop-blur-md bg-black/30 rounded-none md:rounded-tr-3xl md:rounded-br-[90px]", // glass look
                    fadeIn
                  )}
                  style={{
                    minHeight: "340px",
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-anime-secondary font-semibold uppercase tracking-widest text-xs sm:text-sm mb-2">
                      #{index + 1} Featured Anime
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-bold text-white mb-3 max-w-2xl leading-[1.1] drop-shadow-xl">
                      {anime.title}
                    </h1>
                    {/* Tags row */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {anime.score && (
                        <span className="px-2 py-1 bg-anime-secondary/20 rounded text-white text-xs">
                          ★ {anime.score.toFixed(1)}
                        </span>
                      )}
                      {anime.type && (
                        <span className="px-2 py-1 bg-anime-primary/30 rounded text-white text-xs">
                          {anime.type}
                        </span>
                      )}
                      {anime.episodes && (
                        <span className="px-2 py-1 bg-anime-accent/30 rounded text-white text-xs">
                          {anime.episodes} Episodes
                        </span>
                      )}
                    </div>
                    {/* Description */}
                    <p className="text-slate-100/90 text-base sm:text-lg mb-6 max-w-xl line-clamp-5 shadow-lg">
                      {anime.synopsis}
                    </p>
                    <div className="flex gap-3 pt-2">
                      <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-anime-secondary to-anime-primary text-white shadow-lg hover:from-anime-primary hover:to-anime-secondary">
                        <Link to={`/anime/${anime.mal_id}`} className="gap-2 flex items-center">
                          <Play className="w-5 h-5" />
                          Watch Now
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white">
                        <Link to={`/anime/${anime.mal_id}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Right: empty, just shows background image. Hide in mobile */}
                <div className="hidden md:block md:w-1/2 h-full"></div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {/* Progress/Navigation Controls */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-4 items-end">
        {/* Progress bar */}
        <div className="w-32 bg-white/10 rounded-full overflow-hidden h-1.5 hidden sm:block">
          <div
            className="h-full bg-anime-secondary"
            style={{ width: `${progress}%`, transition: "width 100ms linear" }}
          />
        </div>
        {/* Slide indicators */}
        <div className="flex gap-2">
          {animes.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                activeIndex === index 
                  ? "bg-anime-secondary w-6" 
                  : "bg-white/30 hover:bg-white/60"
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleAutoplay}
            className={cn(
              "rounded-full size-10 border-white/30 bg-white/10 hover:bg-anime-secondary/50 text-white transition",
              autoplay ? "ring-2 ring-anime-secondary/30" : ""
            )}
            aria-label={autoplay ? "Pause autoplay" : "Play autoplay"}
          >
            {autoplay ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <Play className="size-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="rounded-full size-10 border-white/30 bg-white/10 hover:bg-anime-secondary/50 text-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="rounded-full size-10 border-white/30 bg-white/10 hover:bg-anime-secondary/50 text-white"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>

      {/* Mobile: overlay fade bottom for text legibility */}
      <div className="absolute md:hidden bottom-0 left-0 w-full h-36 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
    </section>
  );
}

