import { Manga } from '@/services/mangaService';
import { MangaCard } from './MangaCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MangaGridProps {
    manga: Manga[];
    loading?: boolean;
    variant?: 'default' | 'compact' | 'featured';
    columns?: 2 | 3 | 4 | 5 | 6;
    className?: string;
}

const gridColsMap = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
};

export function MangaGrid({
    manga,
    loading = false,
    variant = 'default',
    columns = 5,
    className,
}: MangaGridProps) {
    if (loading) {
        return (
            <div className={cn("grid gap-4", gridColsMap[columns], className)}>
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="space-y-2 animate-pulse">
                        <Skeleton className="aspect-[3/4] rounded-xl bg-manga-glass/60" />
                        <Skeleton className="h-3 w-3/4 bg-manga-glass/60 rounded" />
                        <Skeleton className="h-2.5 w-1/2 bg-manga-glass/60 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (manga.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-manga-glass/50 border border-manga-neon-purple/20 flex items-center justify-center mb-4">
                    <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">No manga found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
        <div className={cn("grid gap-3 md:gap-4", gridColsMap[columns], className)}>
            {manga.map((m, index) => (
                <MangaCard
                    key={m.id}
                    manga={m}
                    variant={variant}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 40}ms` } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

export function MangaGridSkeleton({ count = 10, columns = 5 }: { count?: number; columns?: 2 | 3 | 4 | 5 | 6 }) {
    return (
        <div className={cn("grid gap-3 md:gap-4", gridColsMap[columns])}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                    <Skeleton className="aspect-[3/4] rounded-xl bg-manga-glass/60" />
                    <Skeleton className="h-3 w-3/4 bg-manga-glass/60 rounded" />
                    <Skeleton className="h-2.5 w-1/2 bg-manga-glass/60 rounded" />
                </div>
            ))}
        </div>
    );
}
