import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SimpleManga } from '@/services/mangadexApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MangaHeroProps {
  manga: SimpleManga[];
  autoPlay?: boolean;
  interval?: number;
}

export function MangaHero({ manga, autoPlay = true, interval = 6000 }: MangaHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const featuredManga = manga.slice(0, 5);

  useEffect(() => {
    if (!autoPlay || featuredManga.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, autoPlay, interval, featuredManga.length]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % featuredManga.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + featuredManga.length) % featuredManga.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (featuredManga.length === 0) return null;

  const current = featuredManga[currentIndex];

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
      {/* Background Images */}
      {featuredManga.map((m, index) => (
        <div
          key={m.id}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-out",
            index === currentIndex 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-105"
          )}
        >
          <img
            src={m.coverUrl}
            alt={m.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      
      {/* Animated Pattern Overlay */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 80%, hsl(var(--manga-accent) / 0.2) 0%, transparent 40%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl space-y-6">
            {/* Featured Badge */}
            <div className="flex items-center gap-2 animate-fade-in">
              <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
              <Badge 
                variant="outline" 
                className="capitalize backdrop-blur-sm border-white/20 text-white"
              >
                {current.status}
              </Badge>
            </div>

            {/* Title */}
            <h1 
              key={current.id}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in"
            >
              {current.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 animate-fade-in">
              <span>{current.author}</span>
              {current.year && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-500" />
                  <span>{current.year}</span>
                </>
              )}
              {current.demographic && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-500" />
                  <span className="capitalize">{current.demographic}</span>
                </>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {current.tags.slice(0, 4).map((tag) => (
                <Badge 
                  key={tag}
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-none text-white"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-300 line-clamp-3 max-w-xl animate-fade-in">
              {current.description}
            </p>

            {/* CTA */}
            <div className="flex items-center gap-4 pt-2 animate-fade-in">
              <Button 
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 group"
              >
                <Link to={`/manga/${current.id}`}>
                  <BookOpen className="w-5 h-5 group-hover:animate-pulse" />
                  Read Now
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm"
              >
                <Link to={`/manga/${current.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-1/2 translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="pointer-events-auto w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm border border-white/10"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="pointer-events-auto w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm border border-white/10"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {featuredManga.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "transition-all duration-300 rounded-full",
              index === currentIndex
                ? "w-8 h-2 bg-primary"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-40 w-24 h-24 bg-manga-accent/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
}
