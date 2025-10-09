import { Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type EpisodeFilters as EpisodeFiltersType } from "@/services/episodeService";

interface EpisodeFiltersProps {
  searchQuery: string;
  filters: EpisodeFiltersType;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: keyof EpisodeFiltersType, value: string | number | undefined) => void;
  loading?: boolean;
}

export function EpisodeFilters({ searchQuery, filters, onSearchChange, onFilterChange, loading }: EpisodeFiltersProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search episodes..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
            />
          </div>

          <Select
            value={filters.status || "All"}
            onValueChange={(value) => onFilterChange('status', value === "All" ? undefined : value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Processing Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="QUEUED">Queued</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Filter by Anime ID"
            value={filters.animeId || ""}
            onChange={(e) => onFilterChange('animeId', e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
