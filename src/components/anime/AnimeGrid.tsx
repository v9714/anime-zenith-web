
import { Anime } from "@/services/api";
import { AnimeCard } from "./AnimeCard";

interface AnimeGridProps {
  animes: Anime[];
  showDescription?: boolean;
}

export function AnimeGrid({ animes, showDescription = false }: AnimeGridProps) {
  if (!animes || animes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No anime found</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {animes.map((anime) => (
        <AnimeCard 
          key={anime.id} 
          anime={anime} 
          showDescription={showDescription}
        />
      ))}
    </div>
  );
}
