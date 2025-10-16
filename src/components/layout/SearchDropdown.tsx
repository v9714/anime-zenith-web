import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Clock, Film } from "lucide-react";
import backendAPI from "@/services/backendApi";
import { LazyImage } from "./LazyImage";

interface AnimeSearchResult {
  id: number;
  title: string;
  thumbnail_url?: string;
  release_year?: string;
  season?: string;
  total_episodes?: number;
  duration?: number;
}

interface SearchDropdownProps {
  searchQuery: string;
  onClose: () => void;
}

export function SearchDropdown({ searchQuery, onClose }: SearchDropdownProps) {
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
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
        const response = await backendAPI.get('/api/anime/search', {
          params: {
            title: searchQuery,
            page: 1,
            limit: 8
          }
        });
        
        console.log('Search API Response:', response.data);
        
        // Handle different possible response structures
        let animeData = [];
        
        if (response.data?.success && response.data?.data?.anime) {
          animeData = response.data.data.anime;
        } else if (response.data?.data) {
          animeData = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (Array.isArray(response.data)) {
          animeData = response.data;
        }
        
        console.log('Parsed anime data:', animeData);
        setResults(animeData);
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!searchQuery.trim()) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl max-h-[500px] overflow-y-auto z-[9999]"
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
              className="flex items-start gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0 w-16 h-20 rounded overflow-hidden bg-muted">
                {anime.thumbnail_url ? (
                  <LazyImage
                    src={anime.thumbnail_url}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate mb-1">
                  {anime.title}
                </h4>
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {anime.release_year && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {anime.release_year}
                    </span>
                  )}
                  
                  {anime.season && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                      {anime.season}
                    </span>
                  )}
                  
                  {anime.total_episodes && (
                    <span className="flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      {anime.total_episodes} Episodes
                    </span>
                  )}
                </div>
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
