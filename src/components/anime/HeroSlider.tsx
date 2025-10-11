
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { Anime } from "@/services/api";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/utils/commanFunction";

// Simplified metadata item
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
      className="relative w-full h-[50vh] flex items-stretch overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm border border-border/20 rounded-lg"
    >
      {/* Background with optimized gradient and smooth transitions */}
      <div className="absolute inset-0 z-0 transition-opacity duration-700 ease-in-out">
        {/* Background image with improved opacity and smooth fade */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 rounded-lg transition-all duration-700 ease-in-out"
          style={{
            backgroundImage: currentAnime
              ? `url(${getImageUrl(currentAnime.coverImage || currentAnime.bannerImage)})`
              : undefined,
          }}
        />
        {/* Simplified gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/60 rounded-lg" />
      </div>

      {/* Content - Fixed positioning to prevent movement */}
      <div className="absolute inset-0 flex flex-col">
        {/* Main content area with fixed positioning */}
        <div className="flex-1 relative z-10 flex flex-col md:flex-row items-center px-6 md:px-8 py-6">
          {/* LEFT: anime info panel - Fixed height container with smooth animations */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center pr-0 md:pr-8">
            <div className="space-y-3 animate-fade-in">
              <span className="block uppercase tracking-widest text-xs md:text-sm font-semibold text-anime-secondary animate-fade-in" style={{ animationDelay: "0.1s" }}>
                #{activeIndex + 1} Spotlight
              </span>
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight line-clamp-2 min-h-[3rem] animate-fade-in" style={{ animationDelay: "0.2s" }}>
                {currentAnime?.title}
              </h1>

              {/* Metadata with responsive display and smooth fade */}
              <div className="flex flex-wrap items-center min-h-[2rem] animate-fade-in" style={{ animationDelay: "0.3s" }}>
                {meta.slice(0, 3).map(({ label, value }) => (
                  <MetaItem key={label} label={label} value={value} />
                ))}
              </div>

              {/* Synopsis with fixed height and smooth fade */}
              <p className="text-xs md:text-sm text-white/90 leading-relaxed line-clamp-2 md:line-clamp-3 min-h-[2.5rem] md:min-h-[3.5rem] animate-fade-in" style={{ animationDelay: "0.4s" }}>
                {currentAnime?.description}
              </p>

              {/* Buttons with fixed positioning and smooth fade */}
              <div className="flex gap-3 pt-2 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <Button asChild className="rounded-full px-4 py-2 bg-anime-primary hover:bg-anime-secondary text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Link to={`/anime/${currentAnime?.id}`} className="flex gap-2 items-center">
                    <Play className="w-4 h-4" />
                    Watch
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/30 px-4 py-2 bg-white/10 hover:bg-anime-primary/20 text-white transition-all duration-300 hover:scale-105">
                  <Link to={`/anime/${currentAnime?.id}`}>Details</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: anime image with fixed dimensions and hover effects */}
          <div className="hidden md:flex w-1/2 h-full justify-center items-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative w-48 h-64 lg:w-56 lg:h-80 flex-shrink-0 group">
              <img
                src={getImageUrl(currentAnime?.coverImage || currentAnime?.bannerImage)}
                alt={currentAnime?.title}
                className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-lg transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-anime-primary/30"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-anime-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>

        {/* Navigation section - Absolute positioned to stay fixed */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-8 pb-4">
          <div className="flex items-center justify-between">
            {/* Slide indicators */}
            <div className="flex justify-center gap-2 flex-1">
              {animes.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    activeIndex === index
                      ? "bg-anime-secondary w-4"
                      : "bg-white/30 hover:bg-white/60"
                  )}
                  onClick={() => handleSlideChange(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Control buttons - Fixed positioning */}
            <div className="flex gap-2 ml-4 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoplay}
                className="rounded-full bg-black/40 border-white/20 hover:bg-black/60 text-white w-8 h-8 p-0"
                title={isPlaying ? "Pause slideshow" : "Play slideshow"}
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSlideChange((activeIndex + 1) % animes.length)}
                className="rounded-full bg-black/40 border-white/20 hover:bg-black/60 text-white w-8 h-8 p-0"
                title="Next slide"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
