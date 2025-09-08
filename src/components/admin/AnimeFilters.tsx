import { Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimeFilters as AnimeFiltersType } from "@/services/adminAnimeService";

interface AnimeFiltersProps {
  searchQuery: string;
  filters: AnimeFiltersType;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: keyof AnimeFiltersType, value: string | number | undefined) => void;
}

export function AnimeFilters({ searchQuery, filters, onSearchChange, onFilterChange }: AnimeFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anime..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <Select 
            value={filters?.status || "All"} 
            onValueChange={(value) => onFilterChange('status', value === "All" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Airing">Airing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.type || "All"} 
            onValueChange={(value) => onFilterChange('type', value === "All" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="TV">TV</SelectItem>
              <SelectItem value="Movie">Movie</SelectItem>
              <SelectItem value="OVA">OVA</SelectItem>
              <SelectItem value="ONA">ONA</SelectItem>
              <SelectItem value="Special">Special</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Filter by year"
            value={filters.year || ""}
            onChange={(e) => onFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>
      </CardContent>
    </Card>
  );
}