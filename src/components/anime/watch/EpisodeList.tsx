
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EpisodeListProps {
  episodes: string[];
  active?: number;
  onSelectEpisode?: (index: number) => void;
}

export function EpisodeList({ episodes, active = 0, onSelectEpisode }: EpisodeListProps) {
  return (
    <Card className="bg-card/90 shadow-xl overflow-hidden border-border/50 h-[450px]">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Episodes</h3>
          <Badge variant="outline" className="text-xs">Season 1</Badge>
        </div>
        
        <ScrollArea className="h-[400px] pr-2">
          <ul className="space-y-1">
            {episodes.map((ep, i) => (
              <li
                key={i}
                className={`group hover:bg-primary/15 transition-colors rounded-md flex items-center p-2 gap-2 cursor-pointer ${
                  i === active ? "bg-primary/20 text-primary" : ""
                }`}
                onClick={() => onSelectEpisode && onSelectEpisode(i)}
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                  i === active ? "bg-primary text-white" : "bg-accent/20 text-foreground group-hover:bg-primary/30"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{ep}</p>
                  <p className="text-xs text-muted-foreground">24:15</p>
                </div>
                <Play className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                  i === active ? "text-primary" : "text-muted-foreground"
                }`} />
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
