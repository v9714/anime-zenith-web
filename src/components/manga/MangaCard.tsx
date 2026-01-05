import { Link } from 'react-router-dom';
import { SimpleManga } from '@/services/mangadexApi';
import { Badge } from '@/components/ui/badge';
import { Star, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MangaCardProps {
  manga: SimpleManga;
  variant?: 'default' | 'compact' | 'featured';
  showStatus?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function MangaCard({ manga, variant = 'default', showStatus = true, className, style }: MangaCardProps) {
  const statusColors: Record<string, string> = {
    ongoing: 'bg-green-500/20 text-green-400 border-green-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    hiatus: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  if (variant === 'compact') {
    return (
      <Link
        to={`/manga/${manga.id}`}
        style={style}
        className={cn(
          "group flex gap-3 p-2 rounded-lg bg-card/50 hover:bg-card border border-transparent hover:border-primary/20 transition-all duration-300",
          className
        )}
      >
        <div className="relative w-16 h-24 flex-shrink-0 rounded-md overflow-hidden">
          <img
            src={manga.coverUrl}
            alt={manga.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {manga.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{manga.author}</p>
          {manga.lastChapter && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              Ch. {manga.lastChapter}
            </p>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        to={`/manga/${manga.id}`}
        style={style}
        className={cn(
          "group relative aspect-[2/3] rounded-xl overflow-hidden",
          className
        )}
      >
        {/* Background Image */}
        <img
          src={manga.coverUrl}
          alt={manga.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
        </div>
        
        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
          {showStatus && (
            <Badge 
              variant="outline" 
              className={cn("capitalize text-xs", statusColors[manga.status])}
            >
              {manga.status}
            </Badge>
          )}
          
          <h3 className="font-bold text-lg line-clamp-2 text-white group-hover:text-primary transition-colors">
            {manga.title}
          </h3>
          
          <div className="flex items-center gap-3 text-xs text-gray-300">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {manga.lastChapter ? `Ch. ${manga.lastChapter}` : 'N/A'}
            </span>
            {manga.year && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {manga.year}
              </span>
            )}
          </div>
        </div>

        {/* Hover Border Effect */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-xl transition-colors duration-300" />
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      to={`/manga/${manga.id}`}
      style={style}
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Status Badge */}
        {showStatus && (
          <div className="absolute top-2 left-2">
            <Badge 
              variant="outline" 
              className={cn("capitalize text-xs backdrop-blur-sm", statusColors[manga.status])}
            >
              {manga.status}
            </Badge>
          </div>
        )}
        
        {/* Tags */}
        {manga.tags.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
            {manga.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag}
                variant="secondary"
                className="text-[10px] bg-black/60 backdrop-blur-sm border-none"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3 space-y-1 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors flex-1">
          {manga.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{manga.author}</span>
          {manga.lastChapter && (
            <span className="flex-shrink-0 ml-2">Ch. {manga.lastChapter}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
