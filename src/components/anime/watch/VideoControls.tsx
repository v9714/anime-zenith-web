
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Languages, List, Users, Heart, Share } from "lucide-react";

export function VideoControls() {
  return (
    <Card className="bg-card border-border/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2 h-9 px-4">
                  <Languages className="h-4 w-4" /> Audio & Subtitles
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" className="w-64 p-3">
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-foreground">Audio Language</div>
                  <div className="grid gap-2">
                    <Button size="sm" variant="secondary" className="justify-start h-8 text-xs">
                      🇯🇵 Japanese (Original)
                    </Button>
                    <Button size="sm" variant="ghost" className="justify-start h-8 text-xs">
                      🇺🇸 English (Dubbed)
                    </Button>
                  </div>
                  <div className="text-sm font-semibold text-foreground mt-4">Subtitles</div>
                  <div className="grid gap-2">
                    <Button size="sm" variant="secondary" className="justify-start h-8 text-xs">
                      🇺🇸 English
                    </Button>
                    <Button size="sm" variant="ghost" className="justify-start h-8 text-xs">
                      🇪🇸 Spanish
                    </Button>
                    <Button size="sm" variant="ghost" className="justify-start h-8 text-xs">
                      ❌ Off
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button size="sm" variant="outline" className="gap-2 h-9 px-4">
              <List className="h-4 w-4" /> Playlist
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="default" className="gap-2 h-9 px-6 bg-primary hover:bg-primary/90">
                  <Users className="h-4 w-4" /> Watch Together
                </Button>
              </TooltipTrigger>
              <TooltipContent>Watch with friends in real-time</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2 h-9 px-4">
                  <Heart className="h-4 w-4" /> Favorite
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add to favorites</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2 h-9 px-4">
                  <Share className="h-4 w-4" /> Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share this episode</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
