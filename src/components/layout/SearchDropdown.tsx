import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Clock, Film, Star, Calendar, BookOpen, User } from "lucide-react";
import { unifiedSearch, Anime } from "@/services/api";
import { LazyImage } from "./LazyImage";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/utils/commanFunction";

interface SearchDropdownProps {
  searchQuery: string;
  onClose: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

interface MangaResult {
  id: number;
  title: string;
  coverImage: string;
  status: string;
  rating: string | null;
  author: string | null;
}

export function SearchDropdown({ searchQuery, onClose, inputRef }: SearchDropdownProps) {
  const [animeResults, setAnimeResults] = useState<Anime[]>([]);
  const [mangaResults, setMangaResults] = useState<MangaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setAnimeResults([]);
        setMangaResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await unifiedSearch(searchQuery, 5);
        if (response.success) {
          setAnimeResults(response.data.anime);
          setMangaResults(response.data.manga);
        }
      } catch (error) {
        console.error('Search error:', error);
        setAnimeResults([]);
        setMangaResults([]);
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

  const hasResults = animeResults.length > 0 || mangaResults.length > 0;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl max-h-[550px] overflow-y-auto z-[9999]"
    >
      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">
          <div className="animate-pulse flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            Searching...
          </div>
        </div>
      ) : hasResults ? (
        <div className="py-2 divide-y divide-border">
          {/* Anime Section */}
          {animeResults.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Film className="w-3 h-3" />
                Anime
              </div>
              {animeResults.map((anime) => (
                <Link
                  key={`anime-${anime.id}`}
                  to={`/anime/${anime.id}`}
                  onClick={onClose}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-accent transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-16 rounded overflow-hidden bg-muted shadow-sm flex items-center justify-center border border-border/50">
                    {anime.coverImage ? (
                      <LazyImage
                        src={getImageUrl(anime.coverImage)}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-1 text-center bg-accent/20">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase break-words leading-tight">
                          {anime.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                      {anime.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {anime.rating && (
                        <span className="text-[10px] flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          {anime.rating}
                        </span>
                      )}
                      {anime.type && (
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground capitalize">
                          {anime.type}
                        </span>
                      )}
                      {anime.year && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {anime.year}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Manga Section */}
          {mangaResults.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                Manga
              </div>
              {mangaResults.map((manga) => (
                <Link
                  key={`manga-${manga.id}`}
                  to={`/manga/${manga.id}`}
                  onClick={onClose}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-accent transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-16 rounded overflow-hidden bg-muted shadow-sm flex items-center justify-center border border-border/50">
                    {manga.coverImage ? (
                      <LazyImage
                        src={getImageUrl(manga.coverImage)}
                        alt={manga.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-1 text-center bg-accent/20">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase break-words leading-tight">
                          {manga.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                      {manga.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {manga.rating && (
                        <span className="text-[10px] flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          {manga.rating}
                        </span>
                      )}
                      {manga.author && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 overflow-hidden">
                          <User className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{manga.author}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            to={`/search?title=${encodeURIComponent(searchQuery)}`}
            onClick={onClose}
            className="block py-2 text-center text-xs font-medium text-primary hover:bg-accent/50 transition-colors"
          >
            View all results for "{searchQuery}"
          </Link>
        </div>
      ) : (
        <div className="p-6 text-center text-muted-foreground">
          <p className="text-sm font-medium">No results found for "{searchQuery}"</p>
          <p className="text-xs mt-1 opacity-70">Try searching for something else</p>
        </div>
      )}
    </div>
  );
}
