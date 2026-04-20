import { Link } from 'react-router-dom';
import { Manga } from '@/services/mangaService';
import { Badge } from '@/components/ui/badge';
import { Star, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl as getSharedImageUrl } from '@/utils/commanFunction';
import { MANGA_API_URL } from '@/utils/constants';
import { SmartImage } from '@/components/ui/SmartImage';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

interface MangaCardProps {
    manga: Manga;
    variant?: 'default' | 'compact' | 'featured';
    showStatus?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const statusGradient: Record<string, string> = {
    ongoing: 'from-manga-neon-purple to-manga-neon-pink',
    completed: 'from-manga-neon-cyan to-manga-accent',
    hiatus: 'from-amber-500 to-orange-500',
    cancelled: 'from-red-500 to-rose-700',
};

export function MangaCard({ manga, variant = 'default', showStatus = true, className, style }: MangaCardProps) {
    const isMdx = manga._source === 'mangadex';

    const getImageUrl = (path: string | null) => {
        if (!path) return '/placeholder-manga.jpg';
        // MangaDex URLs are already full URLs
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return getSharedImageUrl(path || undefined, MANGA_API_URL) || "/placeholder-manga.jpg";
    };

    const status = manga.status?.toLowerCase() || '';
    const gradient = statusGradient[status] || 'from-manga-primary to-manga-secondary';

    const renderTooltipContent = (
        <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-tight">
                    {manga.titleEng || manga.title}
                </h4>
                {manga.rating && parseFloat(manga.rating) > 0 && (
                    <div className="flex items-center gap-1 shrink-0 bg-yellow-400/10 px-1.5 py-0.5 rounded text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{parseFloat(manga.rating).toFixed(1)}</span>
                    </div>
                )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {showStatus && manga.status && (
                    <span className={cn("font-medium capitalize", status === 'ongoing' ? 'text-manga-neon-pink' : status === 'completed' ? 'text-manga-neon-cyan' : 'text-manga-neon-purple')}>
                        {manga.status}
                    </span>
                )}
                {manga.releaseYear && <span>{manga.releaseYear}</span>}
                {manga.author && <span className="truncate max-w-[120px]">{manga.author}</span>}
            </div>

            {manga.genres && manga.genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {manga.genres.map((mg) => (
                        <span key={mg.genre.id} className="text-[10px] px-2 py-0.5 rounded-full bg-manga-neon-purple/10 border border-manga-neon-purple/20 text-manga-neon-purple/90 font-medium leading-none">
                            {mg.genre.name}
                        </span>
                    ))}
                </div>
            )}

            {manga.description ? (
                <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-5">
                    {manga.description}
                </p>
            ) : (
                <p className="text-xs text-muted-foreground/50 italic">
                    No description available.
                </p>
            )}

            <div className="pt-2">
                <Link to={`/manga/${manga.id}`}>
                    <Button className="w-full bg-manga-neon-purple hover:bg-manga-neon-pink text-white font-semibold flex items-center justify-center gap-2 rounded-xl transition-colors">
                        <BookOpen className="w-4 h-4" />
                        Read Now
                    </Button>
                </Link>
            </div>
        </div>
    );

    /* ── Compact variant ─────────────────────────────────────────── */
    if (variant === 'compact') {
        return (
            <Link
                to={`/manga/${manga.id}`}
                style={style}
                className={cn(
                    "group flex gap-3 p-2 rounded-xl bg-manga-glass/40 hover:bg-manga-glass/70 border border-manga-neon-purple/10 hover:border-manga-neon-purple/30 transition-all duration-300",
                    className
                )}
            >
                <div className="relative w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <SmartImage
                        src={getImageUrl(manga.coverImage)}
                        alt={manga.titleEng || manga.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-manga-neon-pink transition-colors">
                        {manga.titleEng || manga.title}
                        {isMdx && <span className="ml-1.5 inline-flex items-center rounded-md bg-[#ff6740]/20 px-1 py-0.5 text-[9px] font-bold text-[#ff6740] ring-1 ring-inset ring-[#ff6740]/40 align-middle shadow-sm">MD</span>}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{manga.author || 'Unknown'}</p>
                </div>
            </Link>
        );
    }

    /* ── Featured variant ────────────────────────────────────────── */
    if (variant === 'featured') {
        return (
            <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                    <Link
                        to={`/manga/${manga.id}`}
                        style={style}
                        className={cn(
                            "group relative block rounded-2xl overflow-hidden",
                            className
                        )}
                    >
                        {/* Fixed aspect ratio so all featured cards are the same height */}
                        <div className="relative aspect-[3/4] w-full">
                    <SmartImage
                        src={getImageUrl(manga.coverImage)}
                        alt={manga.titleEng || manga.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-manga-dark via-manga-dark/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Neon border on hover */}
                    <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-manga-neon-purple via-manga-neon-pink to-manga-neon-cyan transition-opacity duration-300 blur-sm -z-10" />

                    {/* Status badge */}
                    {showStatus && manga.status && (
                        <Badge className={`absolute top-2 right-2 bg-gradient-to-r ${gradient} text-white text-[9px] font-bold border-none shadow-lg px-2 py-0.5`}>
                            {manga.status}
                        </Badge>
                    )}

                    {/* Rating badge */}
                    {manga.rating && parseFloat(manga.rating) > 0 && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-manga-dark/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-[10px] font-medium">{parseFloat(manga.rating).toFixed(1)}</span>
                        </div>
                    )}



                    {/* Info footer */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-manga-dark to-transparent">
                        <h3 className="font-bold text-sm line-clamp-1 text-foreground group-hover:text-manga-neon-pink transition-colors duration-300">
                            {manga.titleEng || manga.title}
                            {isMdx && <span className="ml-1.5 inline-flex items-center rounded-md bg-[#ff6740]/20 px-1 py-0.5 text-[9px] font-bold text-[#ff6740] ring-1 ring-inset ring-[#ff6740]/40 align-middle shadow-sm">MD</span>}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-manga-neon-purple inline-block" />
                            {manga.author || 'Unknown Author'}
                        </p>
                    </div>
                </div>
            </Link>
        </HoverCardTrigger>
        <HoverCardContent 
            side="right" 
            align="start" 
            sideOffset={15} 
            className="hidden md:block w-72 bg-manga-dark/95 backdrop-blur-xl border border-manga-neon-purple/20 shadow-2xl shadow-manga-neon-purple/10 p-0 z-[60]"
        >
            {renderTooltipContent}
            <HoverCardPrimitive.Arrow className="fill-manga-dark/95" width={16} height={8} />
        </HoverCardContent>
    </HoverCard>
        );
    }

    /* ── Default variant ─────────────────────────────────────────── */
    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                <Link
                    to={`/manga/${manga.id}`}
                    style={style}
                    className={cn("group block", className)}
                >
                    {/* Outer wrapper — fixed aspect ratio ensures uniform height across all cards */}
                    <div className="relative rounded-xl md:rounded-2xl overflow-hidden transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                {/* Neon glow border on hover */}
                <div className="absolute -inset-[1px] rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-manga-neon-purple via-manga-neon-pink to-manga-neon-cyan transition-opacity duration-300 blur-sm" />

                <div className="relative backdrop-blur-sm bg-manga-glass/60 rounded-xl md:rounded-2xl overflow-hidden border border-manga-neon-purple/10 group-hover:border-transparent flex flex-col">
                    {/* Cover — fixed 3:4 aspect ratio */}
                    <div className="relative aspect-[3/4] overflow-hidden flex-shrink-0">
                        <SmartImage
                            src={getImageUrl(manga.coverImage)}
                            alt={manga.titleEng || manga.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-manga-dark via-manga-dark/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                        {/* Status badge — top right */}
                        {showStatus && manga.status && (
                            <Badge className={`absolute top-2 right-2 bg-gradient-to-r ${gradient} text-white text-[9px] font-bold border-none shadow-lg px-2 py-0.5`}>
                                {manga.status}
                            </Badge>
                        )}

                        {/* Rating badge — top left */}
                        {manga.rating && parseFloat(manga.rating) > 0 && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-manga-dark/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                                <span className="text-yellow-400 text-xs">★</span>
                                <span className="text-white text-[10px] font-medium">{parseFloat(manga.rating).toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    {/* Info — fixed min-height keeps all cards the same height */}
                    <div className="p-2.5 md:p-3 bg-gradient-to-t from-manga-dark to-manga-glass/80 min-h-[72px] flex flex-col justify-between gap-1">
                        {/* Title */}
                        <h3 className="font-bold text-[11px] md:text-xs line-clamp-1 text-foreground group-hover:text-manga-neon-pink transition-colors duration-300">
                            {manga.titleEng || manga.title}
                            {isMdx && <span className="ml-1.5 inline-flex items-center rounded-md bg-[#ff6740]/20 px-1 py-0.5 text-[9px] font-bold text-[#ff6740] ring-1 ring-inset ring-[#ff6740]/40 align-middle shadow-sm">MD</span>}
                        </h3>

                        {/* Author + Year */}
                        <p className="text-[9px] md:text-[10px] text-muted-foreground line-clamp-1 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-manga-neon-purple flex-shrink-0" />
                            <span className="truncate">{manga.author || 'Unknown'}</span>
                            {manga.releaseYear && (
                                <>
                                    <span className="text-manga-neon-purple/40 flex-shrink-0">•</span>
                                    <span className="flex-shrink-0 text-manga-neon-cyan/70">{manga.releaseYear}</span>
                                </>
                            )}
                        </p>

                        {/* Genre pills — up to 2 visible, rest as +N */}
                        {manga.genres && manga.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {manga.genres.slice(0, 2).map((mg) => (
                                    <span
                                        key={mg.genre.id}
                                        className="text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full bg-manga-neon-purple/10 border border-manga-neon-purple/20 text-manga-neon-purple/80 font-medium leading-none"
                                    >
                                        {mg.genre.name}
                                    </span>
                                ))}
                                {manga.genres.length > 2 && (
                                    <span className="text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full bg-manga-glass/50 border border-manga-neon-purple/10 text-muted-foreground leading-none">
                                        +{manga.genres.length - 2}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </Link>
        </HoverCardTrigger>
        <HoverCardContent 
            side="right" 
            align="start" 
            sideOffset={15} 
            className="hidden md:block w-72 bg-manga-dark/95 backdrop-blur-xl border border-manga-neon-purple/20 shadow-2xl shadow-manga-neon-purple/10 p-0 z-[60]"
        >
            {renderTooltipContent}
            <HoverCardPrimitive.Arrow className="fill-manga-dark/95" width={16} height={8} />
        </HoverCardContent>
    </HoverCard>
    );
}

