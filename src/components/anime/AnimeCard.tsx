
import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { Anime } from "@/services/api";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface AnimeCardProps {
  anime: Anime;
  className?: string;
  showDescription?: boolean;
}

export function AnimeCard({ anime, className = "", showDescription = false }: AnimeCardProps) {
  return (
    <Card className={`overflow-hidden group transition-all hover:shadow-md ${className}`}>
      <div className="relative overflow-hidden">
        <AspectRatio ratio={3/4}>
          <img 
            // src={anime?.images?.webp.large_image_url || anime?.images?.jpg?.large_image_url} 
            src={anime?.coverImage} 
            alt={anime.title}
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <Button asChild variant="secondary" size="sm" className="rounded-full bg-primary/90 text-white">
              <Link to={`/anime/${anime.id}`} className="flex items-center gap-1">
                <Play className="h-3.5 w-3.5" />
                <span>Details</span>
              </Link>
            </Button>
          </div>
        </AspectRatio>
        
        {anime.rating && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1 px-2 flex items-center gap-1 text-xs font-medium text-yellow-400">
            <Star className="h-3 w-3 fill-yellow-400" />
            <span>{anime.rating}</span>
          </div>
        )}
        
        {anime.type && (
          <Badge variant="outline" className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm border-none text-white">
            {anime.type}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-medium line-clamp-1 text-sm">{anime.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
          {anime.season && `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}`}
          {anime.votesCount && ` • ${anime.votesCount} episodes`}
        </p>
        
        {showDescription && anime.synopsis && (
          <p className="text-xs mt-2 text-muted-foreground line-clamp-3">{anime.synopsis}</p>
        )}
      </CardContent>
      
      <CardFooter className="p-3 pt-0 gap-1 flex-wrap">
        {anime.genres?.slice(0, 3).map(genre => (
          <Badge 
            key={genre.mal_id}
            variant="secondary" 
            className="text-[10px] h-5 bg-secondary/50"
          >
            {genre.name}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
}
