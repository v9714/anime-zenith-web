import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { episodeService } from "@/services/episodeService";

interface AnimeOption {
    id: number;
    title: string;
}

interface AnimeSearchInputProps {
    value?: number;
    selectedTitle?: string;
    onSelect: (anime: AnimeOption) => void;
    placeholder?: string;
    className?: string;
}

export function AnimeSearchInput({
    value,
    selectedTitle,
    onSelect,
    placeholder = "Search anime...",
    className
}: AnimeSearchInputProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [animeOptions, setAnimeOptions] = useState<AnimeOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Search anime with debouncing
    useEffect(() => {
        const searchAnime = async () => {
            if (searchQuery.trim().length < 2) {
                setAnimeOptions([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await episodeService.searchAnime(searchQuery);
                if (response.success && Array.isArray(response.data)) {
                    setAnimeOptions(response.data);
                } else {
                    setAnimeOptions([]);
                }
            } catch (error) {
                console.error('Failed to search anime:', error);
                setAnimeOptions([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimeout = setTimeout(searchAnime, 300);
        return () => clearTimeout(debounceTimeout);
    }, [searchQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAnimeSelect = (anime: AnimeOption) => {
        onSelect(anime);
        setSearchQuery("");
        setIsOpen(false);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsOpen(true);
    };

    const hasResults = animeOptions.length > 0;
    const showDropdown = isOpen && (searchQuery.length >= 2 || hasResults);

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            {/* Selected anime display or search input */}
            {value && selectedTitle ? (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => {
                        setIsOpen(!isOpen);
                        inputRef.current?.focus();
                    }}
                >
                    <span className="truncate">{selectedTitle}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            ) : (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        className="pl-10"
                    />
                </div>
            )}

            {/* Dropdown list */}
            {showDropdown && (
                <div className="absolute top-full z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                            Searching...
                        </div>
                    ) : animeOptions.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                            {searchQuery.length < 2 ? "Type at least 2 characters to search" : "No anime found"}
                        </div>
                    ) : (
                        <div className="py-1">
                            {animeOptions.map((anime) => (
                                <button
                                    key={anime.id}
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                                    onClick={() => handleAnimeSelect(anime)}
                                >
                                    <span className="truncate">{anime.title}</span>
                                    {value === anime.id && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}