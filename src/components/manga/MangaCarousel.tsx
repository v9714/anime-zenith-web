import { useRef } from 'react';
import { SimpleManga } from '@/services/mangadexApi';
import { MangaCard } from './MangaCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MangaCarouselProps {
  manga: SimpleManga[];
  loading?: boolean;
  variant?: 'default' | 'featured';
  className?: string;
}

export function MangaCarousel({ 
  manga, 
  loading = false, 
  variant = 'default',
  className 
}: MangaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[180px] space-y-2">
            <Skeleton className="aspect-[2/3] rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (manga.length === 0) return null;

  return (
    <div className={cn("relative group", className)}>
      {/* Scroll Buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 hover:scale-110"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Gradient Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-[1] pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-[1] pointer-events-none" />

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {manga.map((m, index) => (
          <div 
            key={m.id}
            className={cn(
              "flex-shrink-0 animate-fade-in",
              variant === 'featured' ? "w-[220px] md:w-[260px]" : "w-[160px] md:w-[180px]"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <MangaCard 
              manga={m}
              variant={variant}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
