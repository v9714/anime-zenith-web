import { useState, useEffect, useCallback, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Anime } from "@/services/api";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Animation helpers
const fadeIn = "animate-fade-in transition-[opacity,transform] duration-500";

// Metadata item
function MetaItem({ label, value }: { label: string, value?: string | number }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center text-xs md:text-sm bg-white/10 rounded-full px-2 py-1 font-medium mr-2 mb-2">
      <span className="font-semibold text-white/70 pr-1">{label}:</span>
      <span className="text-white/90">{value}</span>
    </span>
  );
}

interface HeroSliderProps {
  animes: Anime[];
  onSlideChange?: (index: number) => void;
}

export function HeroSlider({ animes, onSlideChange }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaApi, setEmblaApi] = useState<any>(null);
  const [autoplay, setAutoplay] = useState(true);
  const [progress, setProgress] = useState(0);
  const isMobile = useIsMobile();
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

  // Get metadata for display
  const meta = [
    { label: "Type", value: currentAnime?.type },
    { label: "Episodes", value: currentAnime?.episodes },
    { label: "Year", value: currentAnime?.year },
    { label: "Status", value: currentAnime?.status },
    { label: "Score", value: currentAnime?.score ? `${currentAnime.score.toFixed(1)}★` : undefined },
  ];

  return (
    <section
      className={cn(
        "relative w-screen h-[50vh] min-h-[400px] flex items-stretch overflow-hidden bg-black",
      )}
    >
      {/* Deep blurred background and overlay */}
      <div className="absolute inset-0 z-0">
        {/* Background image with strong optimization for rendering */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
          style={{
            backgroundImage: currentAnime
              ? `url(${currentAnime.images?.webp?.large_image_url || currentAnime.images?.jpg?.large_image_url})`
              : undefined,
          }}
        />
        {/* Custom gradients for modern anime aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-[#2C0C59]/80 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-[#6E2B99]/20" />
        {/* Enhanced blur effect */}
        <div className="absolute inset-0 backdrop-blur-md pointer-events-none" />
      </div>

      {/* Carousel as content over the blurred BG */}
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
              <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-between">
                {/* LEFT: anime info panel */}
                <div
                  className={cn(
                    "relative z-10 flex flex-col justify-center h-full",
                    "w-full md:w-[75%] max-w-[1100px] min-w-[300px]",
                    "px-4 md:px-20 py-6 md:py-10",
                    "backdrop-blur-md bg-black/40 md:bg-black/20 rounded-none md:rounded-br-[80px] shadow-lg animate-fade-in",
                    isMobile ? "pt-20 " : ""
                  )}
                >
                  <span className="block uppercase tracking-widest text-xs md:text-sm font-semibold text-anime-secondary mb-2 md:mb-4">
                    #{index + 1} Spotlight
                  </span>
                  <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl lg:text-5xl font-bold text-white mb-3 md:mb-6 leading-tight md:leading-[1.07] drop-shadow-lg animate-fade-in line-clamp-2 md:line-clamp-2 text-left">
                    {anime.title}
                  </h1>
                  <div className="flex flex-wrap items-center mb-2 md:mb-4 text-left">
                    {isMobile ? meta.slice(0, 3).map(({ label, value }) => (
                      <MetaItem key={label} label={label} value={value} />
                    )) : meta.map(({ label, value }) => (
                      <MetaItem key={label} label={label} value={value} />
                    ))}
                  </div>
                  <p className="text-sm md:text-base lg:text-lg text-white/90 max-w-3xl mb-4 md:mb-8 leading-relaxed drop-shadow-md animate-fade-in line-clamp-3 md:line-clamp-4 text-left">
                    {anime.synopsis}
                  </p>
                  <div className="flex gap-4 md:gap-5 mt-auto self-start md:self-auto">
                    <Button asChild size={isMobile ? "default" : "lg"} className={cn(
                      "rounded-full px-4 md:px-8 py-2 md:py-3",
                      "bg-gradient-to-r from-anime-secondary to-anime-primary text-white",
                      "font-heading font-bold shadow-lg",
                      "text-base md:text-lg",
                      "hover:from-anime-primary hover:to-anime-secondary transition-all animate-fade-in"
                    )}>
                      <Link to={`/anime/${anime.mal_id}`} className="flex gap-2 items-center">
                        <Play className="w-4 h-4 md:w-5 md:h-5" />
                        {isMobile ? "Watch" : "Watch Now"}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size={isMobile ? "default" : "lg"} className="rounded-full border-white/30 px-4 md:px-8 py-2 md:py-3 bg-white/10 hover:bg-anime-primary/20 text-white font-bold animate-fade-in">
                      <Link to={`/anime/${anime.mal_id}`}>Detail</Link>
                    </Button>
                  </div>
                </div>
                {/* RIGHT: floating/overflowing anime image */}
                <div
                  className={cn(
                    "relative w-full md:w-[40%] h-full flex justify-center items-center overflow-visible pointer-events-none",
                    isMobile ? "absolute top-0 opacity-20" : ""
                  )}
                >
                  <div className="absolute inset-0 w-full h-full bg-anime-primary/10 blur-xl rounded-full scale-75 opacity-70 hidden md:block" />
                  
                  <img
                    src={anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url}
                    alt={anime.title}
                    className={cn(
                      "object-cover rounded-xl shadow-2xl select-none",
                      "h-64 sm:h-80 md:h-[300px] w-auto max-w-full",
                      "absolute md:relative md:left-0 z-10",
                      "transition-all duration-700 ease-in-out",
                      index === activeIndex 
                        ? "opacity-100 md:animate-slide-from-right" 
                        : "opacity-0 translate-x-8",
                      isMobile ? "top-0 md:top-auto" : ""
                    )}
                    style={{
                      boxShadow: "0 10px 30px 0 rgba(80,30,150,0.35)",
                      filter: "drop-shadow(0 2px 12px rgba(100,50,200,0.4))"
                    }}
                    draggable={false}
                  />
                  
                  <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none"></div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Progress and Navigation Controls */}
      <div className={cn(
        "absolute bottom-8 z-30 flex flex-col gap-4 md:gap-6 items-end",
        isMobile ? "right-4" : "right-8" 
      )}>
        {/* Progress bar */}
        <div className="w-24 md:w-40 bg-white/10 rounded-full overflow-hidden h-1.5 md:h-2 hidden md:block">
          <div
            className="h-full bg-anime-secondary"
            style={{ width: `${progress}%`, transition: "width 100ms linear" }}
          />
        </div>
        {/* Slide indicators */}
        <div className="flex gap-2 md:gap-3">
          {animes.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 md:w-3 h-2 md:h-3 rounded-full transition-all duration-300 ring-2 ring-anime-primary/10",
                activeIndex === index 
                  ? "bg-anime-secondary w-6 md:w-8" 
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
              "rounded-full size-8 md:size-10 border-white/10 bg-white/10 hover:bg-anime-secondary/50 text-white transition",
              autoplay ? "ring-2 ring-anime-secondary/30" : ""
            )}
            aria-label={autoplay ? "Pause autoplay" : "Play autoplay"}
          >
            {autoplay ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 md:size-5">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <Play className="size-4 md:size-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="rounded-full size-8 md:size-10 border-white/10 bg-white/10 hover:bg-anime-secondary/50 text-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-4 md:size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="rounded-full size-8 md:size-10 border-white/10 bg-white/10 hover:bg-anime-secondary/50 text-white"
            aria-label="Next slide"
          >
            <ChevronRight className="size-4 md:size-5" />
          </Button>
        </div>
      </div>

      {/* Mobile: stronger bottom fade for text */}
      <div className="absolute md:hidden bottom-0 left-0 w-full h-36 bg-gradient-to-t from-black to-transparent pointer-events-none z-20"></div>
    </section>
  );
}