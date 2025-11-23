import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { genreService, Genre } from "@/services/genreService";

interface GenreMultiSelectProps {
  value: number[];
  onChange: (value: number[]) => void;
  className?: string;
}

export function GenreMultiSelect({ value, onChange, className }: GenreMultiSelectProps) {
  const [genreSearch, setGenreSearch] = useState("");
  const [genreOptions, setGenreOptions] = useState<Genre[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoading(true);
      try {
        const response = genreSearch
          ? await genreService.searchGenres(genreSearch)
          : await genreService.getAllGenres();
        
        setGenreOptions(response?.data || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
        setGenreOptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenres();
  }, [genreSearch]);

  const toggleGenre = (genreId: number) => {
    const newValue = value.includes(genreId)
      ? value.filter((id) => id !== genreId)
      : [...value, genreId];
    onChange(newValue);
  };

  const removeGenre = (genreId: number) => {
    onChange(value.filter((id) => id !== genreId));
  };

  // Find selected genres from options, fallback to creating genre objects from IDs
  const selectedGenres = value
    .map((id) => {
      const found = genreOptions.find((g) => g.id === id);
      return found || { id, name: `Genre ${id}` };
    })
    .filter((g) => g !== null) as Genre[];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full justify-between",
            !value?.length && "text-muted-foreground"
          )}
        >
          {value?.length
            ? `${value.length} genre(s) selected`
            : "Select genres"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <div className="p-2 border-b">
              <Input
                placeholder="Search genres..."
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <ScrollArea className="h-64">
              <div className="p-1">
                {isLoading ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Loading genres...
                  </div>
                ) : genreOptions.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No genres found.
                  </div>
                ) : (
                  genreOptions.map((genre) => (
                    <div
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                        value.includes(genre.id) && "bg-accent"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(genre.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {genre.name}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Selected genres badges */}
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGenres.map((genre) => (
            <Badge key={genre.id} variant="secondary" className="flex items-center gap-1">
              {genre.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeGenre(genre.id)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
