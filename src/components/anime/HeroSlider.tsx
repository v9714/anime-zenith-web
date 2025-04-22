
import { useState, useEffect, useCallback, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Anime } from "@/services/api";

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
  const autoplayDuration = 6000; // 6 seconds per slide
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressStepMs = 50; // Update progress every 50ms for smooth animation

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
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
    }
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    setProgress(0);
    
    if (autoplay) {
      // Reset progress animation
      let progressValue = 0;
      progressIntervalRef.current = setInterval(() => {
        progressValue += (progressStepMs / autoplayDuration) * 100;
        setProgress(Math.min(progressValue, 100));
      }, progressStepMs);
      
      // Set timer for next slide
      autoplayTimerRef.current = setTimeout(scrollNext, autoplayDuration);
    }
  }, [autoplay, scrollNext]);

  // Initialize autoplay
  useEffect(() => {
    resetAutoplay();
    
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [autoplay, activeIndex, resetAutoplay]);

  // Toggle autoplay
  const toggleAutoplay = () => {
    setAutoplay(prev => !prev);
  };

  const currentAnime = animes[activeIndex];
  
  return (
    <section className="relative w-full h-screen overflow-hidden bg-gradient-to-r from-[#1e1532] to-[#251a3d]">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_right,rgba(120,80,240,0.1),transparent_60%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_left,rgba(240,80,120,0.1),transparent_60%)]"></div>
      </div>
      
      {/* Main carousel */}
      <Carousel
        className="w-full h-full"
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
              <div className="flex flex-col md:flex-row h-full w-full px-4 sm:px-8 lg:px-16 py-20 md:py-0">
                {/* Left content column - Text & Details */}
                <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-start z-10 pr-0 md:pr-8 lg:pr-16">
                  <div className="w-full max-w-2xl space-y-6 animate-fade-in">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-10 bg-anime-secondary rounded-full"></div>
                        <span className="text-anime-secondary font-medium tracking-wider uppercase text-sm">
                          #{index + 1} Featured Anime
                        </span>
                      </div>
                      
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
                        {anime.title}
                      </h1>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {anime.score && (
                        <span className="px-3 py-1 bg-anime-secondary/20 backdrop-blur-sm rounded-full text-white text-sm">
                          ★ {anime.score.toFixed(1)}
                        </span>
                      )}
                      {anime.type && (
                        <span className="px-3 py-1 bg-anime-primary/20 backdrop-blur-sm rounded-full text-white text-sm">
                          {anime.type}
                        </span>
                      )}
                      {anime.episodes && (
                        <span className="px-3 py-1 bg-anime-accent/20 backdrop-blur-sm rounded-full text-white text-sm">
                          {anime.episodes} Episodes
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-200/90 text-base sm:text-lg line-clamp-3 sm:line-clamp-4 max-w-xl">
                      {anime.synopsis}
                    </p>
                    
                    <div className="flex gap-4 pt-2">
                      <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-anime-secondary to-anime-primary hover:from-anime-primary hover:to-anime-secondary text-white shadow-lg shadow-purple-500/30 transition-all duration-300">
                        <Link to={`/anime/${anime.mal_id}`} className="gap-2 flex items-center">
                          <Play className="w-5 h-5" />
                          Watch Now
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all duration-300">
                        <Link to={`/anime/${anime.mal_id}`}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Right content column - Image */}
                <div className="w-full md:w-1/2 h-full relative flex items-center justify-center py-6 md:py-16">
                  <div className="absolute inset-0 z-0">
                    {/* Purple circular gradient behind image */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square rounded-full bg-[radial-gradient(circle,rgba(157,78,221,0.3)_0%,rgba(92,53,187,0.1)_40%,transparent_70%)]"></div>
                    
                    {/* Light beams */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] opacity-50 bg-[conic-gradient(from_90deg_at_80%_50%,transparent_60%,rgba(157,78,221,0.2)_75%,transparent_80%)]"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] opacity-30 bg-[conic-gradient(from_270deg_at_20%_50%,transparent_60%,rgba(246,92,139,0.2)_75%,transparent_80%)]"></div>
                  </div>
                  
                  <div className="relative z-10 w-[90%] md:w-[80%] lg:w-[75%] max-w-md animate-fade-in transition-all duration-500 transform hover:scale-105">
                    <div className="absolute -inset-1 bg-gradient-to-r from-anime-secondary via-anime-primary to-anime-accent opacity-70 blur-lg"></div>
                    <img
                      src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                      alt={anime.title}
                      className="relative z-20 w-full h-auto object-cover rounded-xl shadow-2xl border-2 border-white/10"
                      loading={index === 0 ? "eager" : "lazy"}
                      style={{
                        aspectRatio: "2/3",
                        objectFit: "cover",
                        backgroundColor: "#1A1F2C",
                      }}
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* Navigation & Progress controls */}
      <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-4 items-end">
        {/* Progress bar */}
        <div className="w-32 bg-white/10 rounded-full overflow-hidden h-1.5">
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
                  : "bg-white/30 hover:bg-white/50"
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleAutoplay}
            className={cn(
              "rounded-full size-10 backdrop-blur border-white/20 hover:bg-white/20 text-white transition-all",
              autoplay ? "bg-anime-secondary/50" : "bg-white/10"
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
            className="rounded-full size-10 backdrop-blur border-white/20 bg-white/10 hover:bg-white/20 text-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="rounded-full size-10 backdrop-blur border-white/20 bg-white/10 hover:bg-white/20 text-white"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
