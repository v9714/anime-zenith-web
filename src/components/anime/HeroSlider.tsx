
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, Pause, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Anime } from "@/services/api";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/utils/commanFunction";

// Metadata badge with glass morphism effect
function MetaItem({ label, value }: { label: string, value?: string | number }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center text-xs md:text-sm bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 font-semibold border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:border-white/30 shadow-lg">
      <span className="text-white/80 pr-1.5">{label}:</span>
      <span className="text-white">{value}</span>
    </span>
  );
}

interface HeroSliderProps {
  animes: Anime[];
  onSlideChange?: (index: number) => void;
}

export function HeroSlider({ animes, onSlideChange }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoplayTimerRef = useRef<number | null>(null);

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying) return;

    // Clear any existing timer
    if (autoplayTimerRef.current) {
      window.clearTimeout(autoplayTimerRef.current);
    }

    // Set new timer
    autoplayTimerRef.current = window.setTimeout(() => {
      const nextIndex = (activeIndex + 1) % animes.length;
      setActiveIndex(nextIndex);
      onSlideChange?.(nextIndex);
    }, 5000); // 5 second interval

    // Cleanup
    return () => {
      if (autoplayTimerRef.current) {
        window.clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [activeIndex, animes.length, isPlaying, onSlideChange]);

  // Handle slide change
  const handleSlideChange = useCallback((newIndex: number) => {
    setActiveIndex(newIndex);
    onSlideChange?.(newIndex);
  }, [onSlideChange]);

  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const currentAnime = animes[activeIndex];

  // Get metadata for display
  const meta = [
    { label: "Type", value: currentAnime?.type },
    { label: "Year", value: currentAnime?.year },
    { label: "Status", value: currentAnime?.status },
    { label: "Rating", value: currentAnime?.rating ? `${currentAnime.rating}★` : undefined },
  ];

  return (
    <section
      className="relative w-full h-[60vh] sm:h-[65vh] md:h-[65vh] flex items-stretch overflow-hidden rounded-2xl shadow-2xl group/slider"
    >
      {/* Background with parallax effect and smooth transitions */}
      <div className="absolute inset-0 z-0 transition-all duration-1000 ease-out">
        {/* Background image with zoom effect on hover */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out group-hover/slider:scale-105"
          style={{
            backgroundImage: currentAnime
              ? `url(${getImageUrl(currentAnime.coverImage || currentAnime.bannerImage)})`
              : undefined,
          }}
        />
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
      </div>

      {/* Content - Fixed positioning to prevent movement */}
      <div className="absolute inset-0 flex flex-col">
        {/* Main content area with fixed positioning */}
        <div className="flex-1 relative z-10 flex flex-col md:flex-row items-center px-4 sm:px-6 md:px-10 lg:px-12 py-4 sm:py-6 md:py-8 pb-24 sm:pb-28 md:pb-24">
          {/* LEFT: anime info panel - Cinematic text presentation */}
          <div className="w-full md:w-3/5 h-full flex flex-col justify-start pr-0 ">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {/* Spotlight badge with glow */}
              <span className="inline-block uppercase tracking-[0.3em] text-xs md:text-sm font-bold text-primary animate-fade-in px-4 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/30 shadow-lg shadow-primary/20" style={{ animationDelay: "0.1s" }}>
                ✨ #{activeIndex + 1} Spotlight
              </span>
              
              {/* Title with dramatic entrance */}
              <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight line-clamp-2 min-h-[3rem] sm:min-h-[4rem] md:min-h-[6rem] animate-fade-in drop-shadow-2xl transition-all duration-300 group-hover/slider:text-primary" style={{ animationDelay: "0.2s" }}>
                {currentAnime?.title}
              </h1>

              {/* Metadata badges with glass morphism */}
              <div className="flex flex-wrap items-center gap-2 min-h-[2.5rem] animate-fade-in" style={{ animationDelay: "0.3s" }}>
                {meta.slice(0, 3).map(({ label, value }) => (
                  <MetaItem key={label} label={label} value={value} />
                ))}
              </div>

              {/* Synopsis with subtle fade */}
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed line-clamp-2 md:line-clamp-3 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[4.5rem] animate-fade-in font-medium drop-shadow-lg" style={{ animationDelay: "0.4s" }}>
                {currentAnime?.description}
              </p>

              {/* Action buttons with glow effects */}
              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 pt-1 sm:pt-2 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <Button 
                  asChild 
                  className="rounded-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary/50 border-2 border-primary/30"
                >
                  <Link to={`/anime/${currentAnime?.id}`} className="flex gap-1.5 sm:gap-2 items-center">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    Watch Now
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="rounded-full border-2 border-white/40 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-bold bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/60 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/20"
                >
                  <Link to={`/anime/${currentAnime?.id}`} className="flex gap-1.5 sm:gap-2 items-center">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add to List
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: anime poster with cinematic effects */}
          <div className="hidden md:flex w-2/5 h-full justify-center items-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative w-56 h-80 lg:w-64 lg:h-96 flex-shrink-0 group/poster">
              {/* Poster image */}
              <img
                src={getImageUrl(currentAnime?.coverImage || currentAnime?.bannerImage)}
                alt={currentAnime?.title}
                className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-2xl transition-all duration-700 ease-out group-hover/poster:scale-110 group-hover/poster:rotate-2 group-hover/poster:shadow-[0_0_40px_rgba(var(--primary),0.6)]"
                loading="lazy"
              />
              {/* Glow overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity duration-700" />
              {/* Border glow */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary opacity-0 group-hover/poster:opacity-30 blur-xl transition-opacity duration-700 -z-10" />
            </div>
          </div>
        </div>

        {/* Navigation section - Centered and with pointer-events to prevent blocking */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pb-4 sm:pb-6 md:pb-8 pointer-events-none">
          <div className="flex items-center justify-between backdrop-blur-sm bg-black/20 rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2 pointer-events-auto">
            {/* Slide indicators with smooth animation */}
            <div className="flex justify-center gap-2 sm:gap-3 flex-1">
              {animes.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-1 sm:h-1.5 rounded-full transition-all duration-500 ease-out",
                    activeIndex === index
                      ? "bg-primary w-8 sm:w-12 shadow-lg shadow-primary/50"
                      : "bg-white/40 w-6 sm:w-8 hover:bg-white/70 hover:w-7 sm:hover:w-10"
                  )}
                  onClick={() => handleSlideChange(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Control buttons with glow effects */}
            <div className="flex gap-2 sm:gap-3 ml-3 sm:ml-4 md:ml-6 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoplay}
                className="rounded-full bg-white/10 backdrop-blur-md border-white/30 hover:border-white/50 text-white w-8 h-8 sm:w-10 sm:h-10 p-0 transition-all duration-300 hover:scale-110"
                title={isPlaying ? "Pause slideshow" : "Play slideshow"}
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSlideChange((activeIndex + 1) % animes.length)}
                className="rounded-full bg-white/10 backdrop-blur-md border-white/30 hover:border-white/50 text-white w-8 h-8 sm:w-10 sm:h-10 p-0 transition-all duration-300 hover:scale-110"
                title="Next slide"
                aria-label="Next slide"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
