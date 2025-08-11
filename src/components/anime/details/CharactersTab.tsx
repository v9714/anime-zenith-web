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
                  <Card className="group p-3 overflow-hidden hover-scale animate-fade-in">
                    <div className="relative rounded-md overflow-hidden">
                      <img src={img} alt={`${c.character.name} character image`} className="w-full h-44 object-cover" loading="lazy" />
                      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/10"></div>
                    </div>
                    <div className="pt-2 space-y-1">
                      <h4 className="font-medium line-clamp-2">{c.character.name}</h4>
                      {c.role ? <Badge variant="outline" className="text-xs rounded-full">{c.role}</Badge> : null}
                      <div className="flex items-center gap-2 pt-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="rounded-full"
                              onClick={() => {
                                navigator.clipboard.writeText(animeTitle);
                                toast({ id: `copy-${Date.now()}`, title: 'Copied!', description: 'Anime name copied to clipboard.' });
                              }}
                            >
                              <Copy className="h-4 w-4 mr-1"/>
                              Copy anime name
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy anime name to clipboard</TooltipContent>
                        </Tooltip>
                        <a href={c.character.url} target="_blank" rel="noreferrer" aria-label="Open on MAL" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <ExternalLink className="h-4 w-4 mr-1"/> MAL
                        </a>
                      </div>
                    </div>
                  </Card>
                </HoverCardTrigger>
                <HoverCardContent className="w-96 animate-enter">
                  <div className="flex gap-3">
                    <img src={img} alt={`${c.character.name} full image`} className="w-24 h-24 object-cover rounded-md shadow" />
                    <div className="space-y-1">
                      <h4 className="font-semibold">{c.character.name}</h4>
                      {details && details.name_kanji ? (
                        <p className="text-xs text-muted-foreground">{details.name_kanji}</p>
                      ) : null}
                      {c.role ? <Badge variant="outline" className="rounded-full text-xs">{c.role}</Badge> : null}
                      {typeof details?.favorites === 'number' ? (
                        <p className="text-xs text-muted-foreground">Favorites: {details.favorites}</p>
                      ) : null}
                      {details?.nicknames?.length ? (
                        <p className="text-xs text-muted-foreground line-clamp-1">AKA: {details.nicknames.join(', ')}</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">Anime: {animeTitle}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {details === null ? (
                      <Skeleton className="h-16 w-full" />
                    ) : details?.about ? (
                      <p className="text-sm leading-relaxed line-clamp-5">{details.about}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No additional details available.</p>
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
