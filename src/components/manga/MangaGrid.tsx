import { SimpleManga } from '@/services/mangadexApi';
import { MangaCard } from './MangaCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MangaGridProps {
  manga: SimpleManga[];
  loading?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function MangaGrid({ 
  manga, 
  loading = false, 
  variant = 'default',
  columns = 5,
  className 
}: MangaGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  if (loading) {
    return (
      <div className={cn("grid gap-4", gridCols[columns], className)}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (manga.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold mb-2">No manga found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {manga.map((m, index) => (
        <MangaCard 
          key={m.id}
          manga={m}
          variant={variant}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// Loading skeleton component
export function MangaGridSkeleton({ count = 10, columns = 5 }: { count?: number; columns?: 2 | 3 | 4 | 5 | 6 }) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns])}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <Skeleton className="aspect-[2/3] rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
