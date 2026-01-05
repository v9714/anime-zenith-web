import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { MangaGrid } from '@/components/manga/MangaGrid';
import { MangaCard } from '@/components/manga/MangaCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { useMangaSearch, useMangaTags } from '@/hooks/useMangaDex';
import { SEO } from '@/components/SEO';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'followedCount', label: 'Most Popular' },
  { value: 'latestUploadedChapter', label: 'Latest Updates' },
  { value: 'createdAt', label: 'Newest' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'rating', label: 'Highest Rated' },
];

const STATUS_OPTIONS = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DEMOGRAPHIC_OPTIONS = [
  { value: 'shounen', label: 'Shounen' },
  { value: 'shoujo', label: 'Shoujo' },
  { value: 'seinen', label: 'Seinen' },
  { value: 'josei', label: 'Josei' },
];

export default function MangaBrowse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');

  const { ref: loadMoreRef, inView } = useInView();
  const { data: tagsData } = useMangaTags();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build filters
  const filters = useMemo(() => ({
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    demographic: selectedDemographics.length > 0 ? selectedDemographics : undefined,
    order: sortBy !== 'relevance' ? sortBy : undefined,
  }), [selectedStatuses, selectedDemographics, sortBy]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMangaSearch(debouncedQuery, filters);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allManga = data?.pages.flatMap(page => page.data) || [];
  const totalResults = data?.pages[0]?.total || 0;

  const activeFiltersCount = selectedStatuses.length + selectedDemographics.length;

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedDemographics([]);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleDemographic = (demo: string) => {
    setSelectedDemographics(prev =>
      prev.includes(demo)
        ? prev.filter(d => d !== demo)
        : [...prev, demo]
    );
  };

  return (
    <Layout>
      <SEO 
        title="Browse Manga - MangaVerse"
        description="Browse and search thousands of manga titles. Filter by genre, status, and more."
      />

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="space-y-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Browse Manga</h1>
            <p className="text-muted-foreground">
              Discover from over 100,000 manga titles
            </p>
          </div>

          {/* Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search manga titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card border-border/50"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Button (Mobile) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 gap-2 sm:hidden">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <FilterSection
                    title="Status"
                    options={STATUS_OPTIONS}
                    selected={selectedStatuses}
                    onToggle={toggleStatus}
                  />
                  <FilterSection
                    title="Demographic"
                    options={DEMOGRAPHIC_OPTIONS}
                    selected={selectedDemographics}
                    onToggle={toggleDemographic}
                  />
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-card rounded-lg border border-border/50">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-10 w-10"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-10 w-10"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden sm:flex flex-wrap items-center gap-4">
            {/* Status Pills */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              {STATUS_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  variant={selectedStatuses.includes(option.value) ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => toggleStatus(option.value)}
                  className="h-8"
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Demographic Pills */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Demographic:</span>
              {DEMOGRAPHIC_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  variant={selectedDemographics.includes(option.value) ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => toggleDemographic(option.value)}
                  className="h-8"
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Results Count */}
          {!isLoading && (
            <p className="text-sm text-muted-foreground">
              {totalResults.toLocaleString()} results found
              {debouncedQuery && ` for "${debouncedQuery}"`}
            </p>
          )}
        </div>

        {/* Results */}
        {viewMode === 'grid' ? (
          <MangaGrid
            manga={allManga}
            loading={isLoading}
            columns={5}
          />
        ) : (
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-24 bg-card/50 rounded-lg animate-pulse" />
              ))
            ) : (
              allManga.map(manga => (
                <MangaCard key={manga.id} manga={manga} variant="compact" />
              ))
            )}
          </div>
        )}

        {/* Load More Trigger */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

// Filter Section Component
function FilterSection({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">{title}</h3>
      <div className="space-y-2">
        {options.map(option => (
          <label
            key={option.value}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
