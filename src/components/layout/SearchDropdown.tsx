import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Clock, Film, Star, Calendar } from "lucide-react";
import { searchAnime, Anime } from "@/services/api";
import { LazyImage } from "./LazyImage";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/utils/commanFunction";

interface SearchDropdownProps {
  searchQuery: string;
  onClose: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function SearchDropdown({ searchQuery, onClose, inputRef }: SearchDropdownProps) {
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchAnime(searchQuery, 1, 8);
        setResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 400);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Don't close if clicking inside the dropdown or the input field
      if (
        (dropdownRef.current && dropdownRef.current.contains(target)) ||
        (inputRef?.current && inputRef.current.contains(target))
      ) {
        return;
      }
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, inputRef]);

  if (!searchQuery.trim()) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl max-h-[500px] overflow-y-auto z-[9999]"
    >
      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">
          <div className="animate-pulse">Searching...</div>
        </div>
      ) : results.length > 0 ? (
        <div className="py-2">
          {results.map((anime) => (
            <Link
              key={anime.id}
              to={`/anime/${anime.id}`}
              onClick={onClose}
              className="flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-0"
            >
              <div className="flex-shrink-0 w-20 h-28 rounded-md overflow-hidden bg-muted shadow-sm">
                {anime.coverImage ? (
                  <LazyImage
                    src={getImageUrl(anime.coverImage)}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <h4 className="font-semibold text-sm text-foreground line-clamp-1 mb-0.5">
                    {anime.title}
                  </h4>
                  {anime.alternativeTitles?.[0] && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {anime.alternativeTitles[0]}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {anime.rating && (
                    <Badge variant="secondary" className="gap-1 px-2 py-0">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-xs font-semibold">{anime.rating}</span>
                    </Badge>
                  )}

                  {anime.year && (
                    <Badge variant="outline" className="gap-1 px-2 py-0">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">{anime.year}</span>
                    </Badge>
                  )}

                  {anime.season && (
                    <Badge variant="outline" className="px-2 py-0">
                      <span className="text-xs">{anime.season}</span>
                    </Badge>
                  )}

                  {anime.type && (
                    <Badge variant="outline" className="px-2 py-0">
                      <span className="text-xs">{anime.type}</span>
                    </Badge>
                  )}
                </div>

                {anime.studio && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {anime.studio}
                  </p>
                )}
              </div>
            </Link>
          ))}

          <Link
            to={`/search?title=${encodeURIComponent(searchQuery)}`}
            onClick={onClose}
            className="block px-3 py-2.5 text-center text-sm text-primary hover:bg-accent/50 transition-colors border-t border-border mt-1"
          >
            View all results for "{searchQuery}"
          </Link>
        </div>
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          <p className="text-sm">No anime found for "{searchQuery}"</p>
          <p className="text-xs mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
