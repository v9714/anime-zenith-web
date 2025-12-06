import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipPortal } from "@/components/ui/tooltip";

interface Episode {
  episodeNumber: number;
  title: string;
  views?: number;
  description?: string;
  isFiller?: boolean;
}

interface EpisodeListProps {
  episodes: Episode[] | string[];
  active?: number;
  watchedEpisodes?: number[];
  onSelectEpisode?: (index: number) => void;
}

export function EpisodeList({ episodes, active = 0, watchedEpisodes = [], onSelectEpisode }: EpisodeListProps) {
  const getEpisodeTitle = (ep: Episode | string, index: number): string => {
    if (typeof ep === 'string') return ep;
    return ep.title || `Episode ${ep.episodeNumber || index + 1}`;
  };

  const getEpisodeNumber = (ep: Episode | string, index: number): number => {
    if (typeof ep === 'string') return index + 1;
    return ep.episodeNumber || index + 1;
  };

  const getEpisodeDescription = (ep: Episode | string, index: number): { text: string; isWatched: boolean } => {
    const isWatched = watchedEpisodes.includes(index);
    if (typeof ep === 'string') {
      return {
        text: isWatched ? "You've watched this episode. Watch again!" : "Watch this exciting episode now!",
        isWatched
      };
    }
    const baseDesc = ep.description || "Watch this exciting episode now!";
    return {
      text: isWatched ? `✓ Watched • ${baseDesc}` : baseDesc,
      isWatched
    };
  };

  const getEpisodeStyles = (index: number, ep: Episode | string): string => {
    const isActive = index === active;
    const isWatched = watchedEpisodes.includes(index);
    const isFiller = typeof ep !== 'string' && ep.isFiller;

    if (isActive) {
      return "bg-primary text-primary-foreground shadow-md scale-105";
    } else if (isFiller) {
      return "bg-red-600/80 text-white hover:bg-red-600 hover:scale-105 border-2 border-red-400";
    } else if (isWatched) {
      return "bg-green-600/80 text-white hover:bg-green-600 hover:scale-105";
    } else {
      return "bg-muted/60 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105";
    }
  };

  return (
    <Card className="relative bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm shadow-2xl overflow-hidden border border-border/30 h-[380px] group hover:shadow-primary/10 transition-shadow duration-300">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardContent className="p-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full" />
            <h3 className="font-heading font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Episodes
            </h3>
          </div>
          {episodes.length > 0 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-primary/10 border-primary/30 text-primary font-medium">
              {episodes.length} EP
            </Badge>
          )}
        </div>

        {episodes.length === 0 ? (
          <div className="h-[320px] flex items-center justify-center">
            <div className="text-center text-muted-foreground space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Play className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm font-medium">No episodes found</p>
              <p className="text-xs">Check back later for new episodes</p>
            </div>
          </div>
        ) : (
          <TooltipProvider>
            <ScrollArea className="h-[320px]">
              <div className="grid grid-cols-5 gap-2 mt-1 pr-2">
                {episodes.map((ep, i) => {
                  const episodeTitle = getEpisodeTitle(ep, i);
                  const episodeNumber = getEpisodeNumber(ep, i);
                  const episodeViews = typeof ep !== 'string' ? ep.views : undefined;
                  const { text: episodeDescription, isWatched } = getEpisodeDescription(ep, i);

                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div
                          className={`relative w-full aspect-square rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center text-sm font-bold shadow-md hover:shadow-xl ${getEpisodeStyles(i, ep)} group/episode`}
                          onClick={() => onSelectEpisode && onSelectEpisode(i)}
                        >
                          <span className="relative z-10">{episodeNumber}</span>

                          {/* Watched checkmark indicator */}
                          {isWatched && i !== active && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}

                          {/* Shine effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover/episode:opacity-100 transition-opacity duration-300 rounded-lg" />

                          {i === active && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              <Play className="h-2.5 w-2.5 text-primary-foreground fill-current" />
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent side="right" className="max-w-[280px] z-[9999] bg-popover/95 backdrop-blur-md border-border/50 shadow-xl">
                          <div className="space-y-2 p-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{episodeTitle}</p>
                              {isWatched && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1.5 py-0">
                                  ✓ Watched
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">EP {episodeNumber}</Badge>
                              {episodeViews && <span>{episodeViews.toLocaleString()} views</span>}
                            </div>
                            <p className="text-xs leading-relaxed text-foreground/80">{episodeDescription}</p>
                            <p className="text-xs font-medium text-primary">
                              {isWatched ? "👆 Click to watch again" : "👆 Click to watch"}
                            </p>
                          </div>
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  );
                })}
              </div>
            </ScrollArea>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}