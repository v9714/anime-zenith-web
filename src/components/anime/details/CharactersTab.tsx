import { useEffect, useMemo, useState } from 'react';
import { searchAnimeByTitle, getCharactersByAnimeMalId, JikanCharacterEntry } from '@/services/openCharacterApi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getCharacterDetailsById, JikanCharacterFull } from '@/services/openCharacterDetailsApi';
interface CharactersTabProps {
  animeTitle: string;
}

export default function CharactersTab({ animeTitle }: CharactersTabProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [characters, setCharacters] = useState<JikanCharacterEntry[]>([]);
  const [detailsCache, setDetailsCache] = useState<Record<number, JikanCharacterFull | null | undefined>>({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function run() {
      try {
        const anime = await searchAnimeByTitle(animeTitle);
        if (!anime) throw new Error('No matching anime found on Jikan');
        const chars = await getCharactersByAnimeMalId(anime.mal_id);
        if (!isMounted) return;
        setCharacters(chars);
      } catch (e) {
        if (!isMounted) return;
        setError('Failed to load characters');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    run();
    return () => { isMounted = false; };
  }, [animeTitle]);

  const ensureDetails = async (id: number) => {
    if (detailsCache[id] !== undefined) return;
    setDetailsCache((prev) => ({ ...prev, [id]: null }));
    const data = await getCharacterDetailsById(id);
    setDetailsCache((prev) => ({ ...prev, [id]: data }));
  };

  const grid = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="p-3 space-y-3 animate-fade-in">
              <Skeleton className="w-full h-40 rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-10 text-muted-foreground">{error}</div>;
    }

    if (!characters.length) {
      return <div className="text-center py-10 text-muted-foreground">No characters found.</div>;
    }

    return (
      <TooltipProvider>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {characters.map((c, idx) => {
            const img = c.character.images?.webp?.image_url || c.character.images?.jpg?.image_url || '';
            const id = c.character.mal_id;
            const details = detailsCache[id];
            return (
                <HoverCard key={`${id}-${idx}`} openDelay={150} onOpenChange={(open) => { if (open) ensureDetails(id); }}>
                 <HoverCardTrigger asChild>
                   <Card className="group relative p-3 overflow-hidden hover-scale animate-fade-in border-2 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-card to-card/50">
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                     <div className="relative rounded-lg overflow-hidden shadow-md">
                       <img src={img} alt={`${c.character.name} character image`} className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                       <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                           {c.role || 'Character'}
                         </Badge>
                       </div>
                     </div>
                     <div className="relative pt-3 space-y-2">
                       <h4 className="font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">{c.character.name}</h4>
                       <div className="flex items-center justify-between">
                         <a href={c.character.url} target="_blank" rel="noreferrer" aria-label="Open on MAL" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors">
                           <ExternalLink className="h-3 w-3 mr-1"/> MAL
                         </a>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button
                               size="icon"
                               variant="ghost"
                               className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                               onClick={() => {
                                 navigator.clipboard.writeText(animeTitle);
                                 toast({ id: `copy-${Date.now()}`, title: 'Copied!', description: 'Anime name copied to clipboard.' });
                               }}
                             >
                               <Copy className="h-3 w-3"/>
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>Copy anime name</TooltipContent>
                         </Tooltip>
                       </div>
                     </div>
                   </Card>
                 </HoverCardTrigger>
                 <HoverCardContent className="w-96 animate-enter border-2 border-primary/10 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                   <div className="flex gap-4">
                     <img src={img} alt={`${c.character.name} full image`} className="w-28 h-28 object-cover rounded-lg shadow-lg border-2 border-primary/20" />
                     <div className="flex-1 space-y-2">
                       <div className="flex items-start justify-between gap-2">
                         <div>
                           <h4 className="font-bold text-lg text-foreground">{c.character.name}</h4>
                           {details && details.name_kanji ? (
                             <p className="text-sm text-muted-foreground font-medium">{details.name_kanji}</p>
                           ) : null}
                         </div>
                       </div>
                       
                       <div className="flex flex-wrap gap-2">
                         {c.role ? <Badge variant="default" className="rounded-full text-xs bg-primary/90">{c.role}</Badge> : null}
                         {typeof details?.favorites === 'number' ? (
                           <Badge variant="secondary" className="rounded-full text-xs">❤️ {details.favorites}</Badge>
                         ) : null}
                       </div>
                       
                       {details?.nicknames?.length ? (
                         <p className="text-xs text-muted-foreground"><span className="font-medium">AKA:</span> {details.nicknames.slice(0, 2).join(', ')}</p>
                       ) : null}
                       
                       <div className="flex items-center justify-between pt-1 border-t border-border/50">
                         <div className="flex items-center gap-2">
                           <span className="text-xs font-medium text-muted-foreground">From:</span>
                           <span className="text-sm font-semibold text-primary">{animeTitle}</span>
                         </div>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button
                               size="icon"
                               variant="ghost"
                               className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                               onClick={() => {
                                 navigator.clipboard.writeText(animeTitle);
                                 toast({ id: `copy-hover-${Date.now()}`, title: 'Copied!', description: 'Anime name copied to clipboard.' });
                               }}
                             >
                               <Copy className="h-3 w-3"/>
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>Copy anime name</TooltipContent>
                         </Tooltip>
                       </div>
                     </div>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-border/50">
                     {details === null ? (
                       <Skeleton className="h-20 w-full rounded-md" />
                     ) : details?.about ? (
                       <div>
                         <h5 className="text-sm font-semibold mb-2 text-foreground">About</h5>
                         <p className="text-sm leading-relaxed line-clamp-4 text-muted-foreground">{details.about}</p>
                       </div>
                     ) : (
                       <p className="text-sm text-muted-foreground italic">No additional details available.</p>
                     )}
                   </div>
                 </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }, [loading, error, characters, animeTitle, toast]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Characters</h3>
        <Badge variant="secondary" className="rounded-full">Open API</Badge>
      </div>
      {grid}
    </section>
  );
}
