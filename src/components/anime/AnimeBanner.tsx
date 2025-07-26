
import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { Anime } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/utils/commanFunction";

interface AnimeBannerProps {
  anime: Anime;
}

export function AnimeBanner({ anime }: AnimeBannerProps) {
  if (!anime) return null;

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={getImageUrl(anime?.coverImage || anime?.bannerImage)}
          alt={anime.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-12 md:py-20 flex flex-col md:flex-row items-center gap-6 md:gap-12">
        {/* Poster */}
        <div className="md:w-1/4 shrink-0">
          <img
            src={getImageUrl(anime.coverImage || anime.bannerImage)}
            alt={anime.title}
            className="w-full max-w-[220px] rounded-md shadow-lg mx-auto md:mx-0"
          />
        </div>

        {/* Info */}
        <div className="md:w-3/4 text-center md:text-left">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
            {anime.type && (
              <Badge variant="outline" className="bg-primary/10 border-primary">
                {anime.type}
              </Badge>
            )}
            {anime.rating && (
              <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500 text-yellow-500 flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500" />
                <span>{anime.rating}</span>
              </Badge>
            )}
            {anime.status && (
              <Badge variant="outline" className="bg-accent/10 border-accent text-accent">
                {anime.status}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-heading font-bold">{anime.title}</h1>
          {anime.alternativeTitles?.en && anime.alternativeTitles.en !== anime.title && (
            <p className="text-lg text-muted-foreground mt-1">{anime.alternativeTitles.en}</p>
          )}

          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
            {anime.genres?.map(genre => (
              <Badge key={genre.mal_id} variant="secondary">
                {genre.name}
              </Badge>
            ))}
          </div>

          <p className="mt-6 text-muted-foreground line-clamp-3 max-w-2xl">
            {anime.description}
          </p>

          <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
            <Button asChild size="lg" className="rounded-full">
              <Link to={`/anime/${anime.id}`} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                <span>Watch Now</span>
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full">
              <Link to={`/anime/${anime.id}/details`}>More Details</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
