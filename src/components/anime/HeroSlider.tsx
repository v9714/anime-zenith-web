
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { Anime } from "@/services/api";
import { cn } from "@/lib/utils";

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
    { label: "Episodes", value: currentAnime?.episodes },
    { label: "Year", value: currentAnime?.year },
    { label: "Status", value: currentAnime?.status },
    { label: "Score", value: currentAnime?.score ? `${currentAnime.score.toFixed(1)}★` : undefined },
  ];

  return (
    <section
      className="relative w-full h-auto min-h-[450px] sm:min-h-[500px] md:min-h-[550px] flex items-stretch overflow-hidden bg-black"
    >
      {/* Background with optimized gradient */}
      <div className="absolute inset-0 z-0">
        {/* Background image with improved opacity */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{
            backgroundImage: currentAnime
              ? `url(${currentAnime.images?.webp?.large_image_url || currentAnime.images?.jpg?.large_image_url})`
              : undefined,
          }}
        />
        {/* Simplified gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex flex-col pt-16 md:pt-0 md:pb-0">
        {/* Main content area with improved mobile layout */}
        <div className="container relative z-10 flex flex-col md:flex-row items-start md:items-center h-full py-4 md:py-8">
          {/* LEFT: anime info panel */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <span className="block uppercase tracking-widest text-xs md:text-sm font-semibold text-anime-secondary mb-2">
              #{activeIndex + 1} Spotlight
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight line-clamp-2">
              {currentAnime?.title}
            </h1>
            
            {/* Metadata with responsive display */}
            <div className="flex flex-wrap items-center mb-2 md:mb-4">
              {meta.slice(0, 3).map(({ label, value }) => (
                <MetaItem key={label} label={label} value={value} />
              ))}
            </div>
            
            {/* Synopsis with better responsiveness */}
            <p className="text-sm md:text-base text-white/90 max-w-2xl mb-4 md:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-3 md:line-clamp-4">
              {currentAnime?.synopsis}
            </p>
            
            {/* Buttons with simplified styling */}
            <div className="flex gap-3 md:gap-4 mt-2 mb-4 md:mt-4">
              <Button asChild className="rounded-full px-4 py-2 bg-anime-primary hover:bg-anime-secondary text-white">
                <Link to={`/anime/${currentAnime?.mal_id}`} className="flex gap-2 items-center">
                  <Play className="w-4 h-4" />
                  Watch
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/30 px-4 py-2 bg-white/10 hover:bg-anime-primary/20 text-white">
                <Link to={`/anime/${currentAnime?.mal_id}`}>Details</Link>
              </Button>
            </div>
          </div>
          
          {/* RIGHT: enlarged anime image with improved styling */}
          <div className="hidden md:flex w-1/2 justify-center items-center">
            <img
              src={currentAnime?.images?.webp?.large_image_url || currentAnime?.images?.jpg?.large_image_url}
              alt={currentAnime?.title}
              className="object-cover rounded-xl shadow-lg h-80 w-auto max-w-full transform transition-all duration-300"
              loading="eager"
            />
          </div>
        </div>
        
        {/* Slide indicators and control buttons - simplified implementation */}
        <div className="container relative z-20 py-4">
          <div className="flex justify-between items-center">
            {/* Slide indicators in the center */}
            <div className="flex-1">
              <div className="flex justify-center gap-2 mt-1">
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
            </div>
            
            {/* Autoplay control button in right corner */}
            <div className="absolute bottom-4 right-4 z-30">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoplay}
                className="rounded-full bg-black/40 border-white/20 hover:bg-black/60 text-white"
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
                className="rounded-full bg-black/40 border-white/20 hover:bg-black/60 text-white ml-2"
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
