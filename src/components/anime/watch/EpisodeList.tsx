import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Episode {
  episodeNumber: number;
  title: string;
  views?: number;
  description?: string;
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

  const getEpisodeDescription = (ep: Episode | string): string => {
    if (typeof ep === 'string') return "Watch this exciting episode now!";
    return ep.description || "Watch this exciting episode now!";
  };

  const getEpisodeStyles = (index: number): string => {
    const isActive = index === active;
    const isWatched = watchedEpisodes.includes(index);

    if (isActive) {
      return "bg-primary text-primary-foreground shadow-md scale-105";
    } else if (isWatched) {
      return "bg-green-600/80 text-white hover:bg-green-600 hover:scale-105";
    } else {
      return "bg-muted/60 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105";
    }
  };

  return (
    <Card className="bg-card/90 shadow-xl overflow-hidden border-border/50 h-[380px]">
      <CardContent className="p-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-base">Episodes</h3>
          {/* <Badge variant="outline" className="text-[14px] px-1 py-0">S1</Badge> */}
        </div>

        <TooltipProvider>
          <ScrollArea className="h-[340px]">
            <div className="grid grid-cols-5 gap-1.5 mt-1">
              {episodes.map((ep, i) => {
                const episodeTitle = getEpisodeTitle(ep, i);
                const episodeNumber = getEpisodeNumber(ep, i);
                const episodeViews = ep.views;
                const episodeDescription = getEpisodeDescription(ep);

                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div
                        className={`relative w-8 h-8 rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center text-[13px] font-semibold ${getEpisodeStyles(i)}`}
                        onClick={() => onSelectEpisode && onSelectEpisode(i)}
                      >
                        {episodeNumber}
                        {i === active && (
                          <div className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center transform translate-x-0.5 -translate-y-0.5 ">
                            <Play className="h-2 w-2 text-primary-foreground fill-current" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[250px]">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{episodeTitle}</p>
                        <p className="text-xs text-muted-foreground">Episode {episodeNumber}</p>
                        <p className="text-xs text-muted-foreground">{episodeViews.toLocaleString()} views</p>
                        <p className="text-xs mt-2">{episodeDescription}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </ScrollArea>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}