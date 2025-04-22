
import { useState, useEffect, useCallback, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Anime } from "@/services/api";
import { cn } from "@/lib/utils";

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
        "relative w-screen h-screen min-h-[500px] flex items-stretch overflow-hidden bg-black"
      )}
      style={{
        backgroundImage: currentAnime
          ? `url(${currentAnime.images?.webp?.large_image_url || currentAnime.images?.jpg?.large_image_url})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Deep blurred background and overlay */}
      <div className="absolute inset-0 z-0">
        {/* strong dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-anime-primary/60 to-black/80" />
        {/* subtle blur overlay */}
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
              {/* Split 50-50 flex, right: anime full image (with left offset) */}
              <div className="relative w-full h-full flex flex-col md:flex-row">
                {/* LEFT: anime info panel */}
                <div
                  className={cn(
                    "relative z-10 flex flex-col justify-center h-[55vh] md:h-full px-6 md:px-16 py-12",
                    "w-full md:w-1/2 max-w-[700px] min-w-[300px]",
                    "backdrop-blur-md bg-black/50 md:bg-black/30 rounded-none md:rounded-br-[80px] shadow-lg animate-fade-in"
                  )}
                  style={{
                    minHeight: "420px"
                  }}
                >
                  <span className="block uppercase tracking-widest text-xs md:text-sm font-semibold text-anime-secondary mb-4">
                    #{index + 1} Spotlight
                  </span>
                  <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-[1.07] drop-shadow-lg animate-fade-in">
                    {anime.title}
                  </h1>
                  <div className="flex flex-wrap items-center mb-4">
                    {meta.map(({ label, value }) => (
                      <MetaItem key={label} label={label} value={value} />
                    ))}
                  </div>
                  <p className="text-base md:text-lg text-white/90 max-w-xl mb-8 drop-shadow-2xl animate-fade-in line-clamp-6 shadow-lg">
                    {anime.synopsis}
                  </p>
                  <div className="flex gap-4">
                    <Button asChild size="lg" className="rounded-full px-8 py-3 bg-gradient-to-r from-anime-secondary to-anime-primary text-white font-heading font-bold shadow-lg text-lg hover:from-anime-primary hover:to-anime-secondary transition-all animate-fade-in">
                      <Link to={`/anime/${anime.mal_id}`} className="flex gap-2 items-center">
                        <Play className="w-5 h-5" />
                        Watch Now
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full border-white/30 px-8 py-3 bg-white/10 hover:bg-anime-primary/20 text-white font-bold animate-fade-in">
                      <Link to={`/anime/${anime.mal_id}`}>Detail</Link>
                    </Button>
                  </div>
                </div>
                {/* RIGHT: floating/overflowing anime image */}
                <div
                  className={cn(
                    "relative w-full md:w-1/2 h-80 md:h-full flex justify-center items-center overflow-visible pointer-events-none transition-all"
                  )}
                >
                  <div className="absolute inset-0 right-auto w-[120vw] h-full opacity-50 blur-[6px] scale-105 -z-10 hidden md:block" />
                  <img
                    src={anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url}
                    alt={anime.title}
                    className={cn(
                      "object-cover shadow-2xl rounded-2xl select-none m-0",
                      "h-64 sm:h-96 md:h-[500px] xl:h-[77vh] w-auto",
                      "absolute right-[-4vw] md:right-[-7vw] z-10 md:shadow-[0_8px_56px_0_rgba(28,24,40,0.4)]",
                      "transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                      index === activeIndex ? "scale-100 opacity-100" : "scale-105 opacity-30"
                    )}
                    style={{
                      maxWidth: "min(44vw,630px)",
                      boxShadow: "0 24px 80px 0 rgba(50,20,110,0.18)",
                      filter: "drop-shadow(0 2px 16px #221F26aa)"
                    }}
                    draggable={false}
                  />
                  {/* A left-to-right mask to blend the image smoothly with background */}
                  <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-transparent to-black/90 z-20 pointer-events-none"></div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Progress and Navigation Controls */}
      <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-6 items-end">
        {/* Progress bar */}
        <div className="w-40 bg-white/10 rounded-full overflow-hidden h-2 hidden md:block">
          <div
            className="h-full bg-anime-secondary"
            style={{ width: `${progress}%`, transition: "width 100ms linear" }}
          />
        </div>
        {/* Slide indicators */}
        <div className="flex gap-3">
          {animes.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 ring-2 ring-anime-primary/10",
                activeIndex === index 
                  ? "bg-anime-secondary w-8" 
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
              "rounded-full size-10 border-white/10 bg-white/10 hover:bg-anime-secondary/50 text-white transition",
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
            className="rounded-full size-10 border-white/10 bg-white/10 hover:bg-anime-secondary/50 text-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="rounded-full size-10 border-white/10 bg-white/10 hover:bg-anime-secondary/50 text-white"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>

      {/* Mobile: strong bottom fade for text */}
      <div className="absolute md:hidden bottom-0 left-0 w-full h-36 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-30"></div>
    </section>
  );
}

