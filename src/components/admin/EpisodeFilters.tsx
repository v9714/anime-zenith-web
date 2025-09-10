/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { type EpisodeFilters } from "@/services/episodeService";

interface EpisodeFiltersProps {
  filters: EpisodeFilters;
  onFiltersChange: (filters: EpisodeFilters) => void;
  loading?: boolean;
}

export function EpisodeFilters({ filters, onFiltersChange, loading }: EpisodeFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Debounce search to prevent cursor issues and reduce API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchInput || undefined });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Update local search input when filters change externally
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value === "all" ? undefined : value });
  };

  const handleAnimeIdChange = (value: string) => {
    const animeId = value ? parseInt(value) : undefined;
    onFiltersChange({ ...filters, animeId });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search episodes..."
          className="pl-8"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          disabled={loading}
        />
      </div>

      <Select
        value={filters.status || "all"}
        onValueChange={handleStatusChange}
        disabled={loading}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Processing Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="READY">Ready</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="QUEUED">Queued</SelectItem>
          <SelectItem value="FAILED">Failed</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="number"
        placeholder="Anime ID"
        className="w-full sm:w-[120px]"
        value={filters.animeId || ""}
        onChange={(e) => handleAnimeIdChange(e.target.value)}
        disabled={loading}
      />
    </div>
  );
}