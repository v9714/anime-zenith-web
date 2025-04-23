import { useState, useEffect, useCallback, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Anime } from "@/services/api";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
        "relative w-screen h-screen min-h-[500px] flex items-stretch overflow-hidden bg-black z-0",
        "transition-all duration-500 ease-in-out"
      )}
    >
      <div className="absolute inset-0 w-full h-full">
        {currentAnime && (
          <div className="absolute right-0 top-0 w-[55vw] h-full hidden md:block z-0 pointer-events-none select-none">
            <img
              src={currentAnime.images?.webp?.large_image_url || currentAnime.images?.jpg?.large_image_url}
              alt={currentAnime.title}
              className={cn(
                "absolute right-[-6vw] top-0 h-full w-auto min-w-[410px] max-w-none object-cover rounded-l-[3.5rem]",
                "shadow-2xl drop-shadow-2xl blur-[2px] brightness-90 opacity-95",
                "transition-all duration-700 ease-in-out"
              )}
              draggable={false}
              style={{
                filter: "blur(2px) saturate(1.165) brightness(0.93)",
                zIndex: 2
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black via-black/60 to-transparent rounded-l-[3.5rem]" />
            <div className="absolute left-0 top-0 h-full w-44 bg-gradient-to-r from-black to-transparent" />
          </div>
        )}
        {currentAnime && (
          <div className="absolute inset-0 md:hidden">
            <img
              src={currentAnime.images?.webp?.large_image_url || currentAnime.images?.jpg?.large_image_url}
              alt={currentAnime.title}
              className="w-full h-full object-cover brightness-[.70] blur-[1.5px] scale-110"
              draggable={false}
              style={{
                zIndex: 1
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>
      <Carousel
        className="relative w-full h-full z-10"
        opts={{
          align: "start",
          loop: true,
          dragFree: false,
        }}
        setApi={setEmblaApi}
      >
        <CarouselContent className="h-full">
          {animes.map((anime, index) => (
            <CarouselItem key={anime.mal_id} className="w-full h-full transition-all">
              <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-between pt-28 md:pt-0 px-4 md:px-12 xl:px-24">
                <div
                  className={cn(
                    "relative z-20 flex flex-col justify-center h-full",
                    "w-full md:w-[60vw] max-w-[700px] rounded-2xl p-7 md:p-0 backdrop-blur-sm",
                    "bg-black/50 md:bg-transparent",
                    "md:pl-8 xl:pl-16 py-6 md:py-12",
                    "text-white animate-fade-in"
                  )}
                  style={{
                    minHeight: "375px"
                  }}
                >
                  <span className="block uppercase tracking-widest text-xs md:text-[15px] font-semibold text-anime-secondary mb-2 md:mb-4 select-none">
                    #{index + 1} Spotlight
                  </span>
                  <h1 className="font-heading text-3xl md:text-5xl font-bold drop-shadow-lg mb-4 md:mb-7 leading-tight line-clamp-2 md:line-clamp-3 max-w-2xl md:max-w-3xl break-words">
                    {anime.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-5">
                    {meta.map(({ label, value }) => (
                      <MetaItem key={label} label={label} value={value} />
                    ))}
                  </div>
                  <p className="text-base md:text-lg text-white/90 max-w-2xl md:max-w-3xl mb-7 leading-relaxed drop-shadow-md line-clamp-4 md:line-clamp-5">
                    {anime.synopsis}
                  </p>
                  <div className="flex gap-5 flex-wrap mt-auto md:mt-0 w-full md:w-auto">
                    <Button asChild size={isMobile ? "default" : "lg"} className={cn(
                      "rounded-full px-8 py-3 font-heading font-bold shadow-lg",
                      "bg-gradient-to-r from-anime-secondary to-anime-primary text-white text-lg border-0",
                      "hover:from-anime-primary hover:to-anime-secondary transition-colors duration-200"
                    )}>
                      <Link to={`/anime/${anime.mal_id}`} className="flex gap-2 items-center">
                        <Play className="w-5 h-5" />
                        {isMobile ? "Watch" : "Watch Now"}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size={isMobile ? "default" : "lg"} className="rounded-full px-8 py-3 border-white/30 bg-white/10 hover:bg-anime-primary/10 text-white font-bold">
                      <Link to={`/anime/${anime.mal_id}`}>Detail</Link>
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block flex-1"></div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className={cn(
        "absolute bottom-10 left-0 w-full flex flex-col items-center z-30 gap-4 md:items-end md:pr-20"
      )}>
        <div className="flex gap-3">
          {animes.map((_, index) => (
            <button
              key={index}
              className={cn(
                "transition-all w-3 md:w-5 h-3 md:h-5 rounded-full mx-1 outline-none focus:ring-2 ring-anime-primary/70",
                activeIndex === index
                  ? "bg-anime-secondary w-12 md:w-16 shadow-lg animate-fade-in"
                  : "bg-white/60 hover:bg-anime-primary/40 opacity-60"
              )}
              style={{ border: activeIndex === index ? "2px solid #D946EF" : undefined }}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-3 mt-1">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleAutoplay}
            className={cn(
              "rounded-full size-9 border-white/20 bg-white/20 hover:bg-anime-secondary/70 text-white transition", 
              autoplay ? "ring-2 ring-anime-secondary/50" : ""
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
            className="rounded-full size-9 border-white/30 bg-white/20 hover:bg-anime-secondary/40 text-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="rounded-full size-9 border-white/30 bg-white/20 hover:bg-anime-secondary/40 text-white"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
        <div className="w-36 md:w-72 bg-white/20 rounded-full overflow-hidden h-1.5 md:h-2 mt-2 md:mt-3 mx-auto">
          <div
            className="h-full bg-anime-secondary"
            style={{ width: `${progress}%`, transition: "width 100ms linear" }}
          />
        </div>
      </div>
    </section>
  );
}
