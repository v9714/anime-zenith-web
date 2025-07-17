
import { Star, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PopularAnime {
  title: string;
  episodes: number;
  img: string;
  id: number;
  rating: number;
}

interface MostPopularSidebarProps {
  popularAnime: PopularAnime[];
}

export function MostPopularSidebar({ popularAnime }: MostPopularSidebarProps) {
  return (
    <Card className="bg-card/90 shadow-xl border-border/50">
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-bold text-sm sm:text-base mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" /> 
          <span className="truncate">Top Anime</span>
        </h3>
        
        <ScrollArea className="max-h-[500px] sm:max-h-[600px]">
          <div className="space-y-2 sm:space-y-3">
            {popularAnime.map((a) => (
              <div 
                key={a.id} 
                className="flex hover:bg-primary/10 transition-colors rounded-lg p-2 cursor-pointer gap-2 sm:gap-3"
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={a.img} 
                    className="w-12 h-16 sm:w-16 sm:h-24 rounded-md object-cover shadow-md" 
                    alt={a.title} 
                  />
                  <div className="absolute top-1 right-1 bg-black/60 text-white text-xs font-medium rounded-md px-1 py-0.5 shadow">
                    {a.rating}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-medium text-xs sm:text-sm line-clamp-2 mb-1 leading-tight">
                    {a.title}
                  </h4>
                  <div className="text-xs text-muted-foreground mb-2">
                    Episodes: {a.episodes}
                  </div>
                  <Button size="sm" className="w-full text-xs bg-primary/90 hover:bg-primary">
                    <Play className="h-3 w-3 mr-1 flex-shrink-0" /> 
                    <span className="truncate">Watch</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
