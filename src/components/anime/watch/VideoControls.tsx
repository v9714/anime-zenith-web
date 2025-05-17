
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
    <Card className="bg-card/90 shadow-lg border-border/50 mb-6">
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1 h-8">
                  <Languages className="h-4 w-4" /> Audio & Subtitles
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" className="w-56 p-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Audio</div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" variant="ghost" className="justify-start h-7 text-xs bg-primary/10 text-primary">Japanese</Button>
                    <Button size="sm" variant="ghost" className="justify-start h-7 text-xs">English</Button>
                  </div>
                  <div className="text-sm font-medium mt-2">Subtitles</div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" variant="ghost" className="justify-start h-7 text-xs bg-secondary/10 text-secondary">English</Button>
                    <Button size="sm" variant="ghost" className="justify-start h-7 text-xs">Spanish</Button>
                    <Button size="sm" variant="ghost" className="justify-start h-7 text-xs">Off</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button size="sm" variant="outline" className="gap-1 h-8">
              <List className="h-4 w-4" /> Playlist
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="default" className="gap-1 h-8 rounded-full bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary">
                  <Users className="h-4 w-4" /> Watch Together
                </Button>
              </TooltipTrigger>
              <TooltipContent>Watch with friends</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1 h-8 rounded-full">
                  <Heart className="h-4 w-4" /> Favorite
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add to favorites</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1 h-8 rounded-full">
                  <Share className="h-4 w-4" /> Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share with friends</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
