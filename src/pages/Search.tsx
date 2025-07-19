
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AnimeGrid } from "@/components/anime/AnimeGrid";
import { searchAnime, Anime, AnimeResponse } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Search as SearchIcon } from "lucide-react";

// Ad component placeholder (for Google AdSense)
const AdBanner = ({ className = "", slot = "banner" }: { className?: string, slot?: string }) => (
  <div className={`bg-muted/30 border border-dashed border-muted-foreground/20 rounded-md p-2 text-center text-xs text-muted-foreground ${className}`}>
    <div className="h-full w-full flex items-center justify-center">
      <div>
        <p>Advertisement</p>
        <p className="text-[10px]">Ad slot: {slot}</p>
      </div>
    </div>
  </div>
);

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const query = searchParams.get("title") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const [searchInput, setSearchInput] = useState(query);
  
  useEffect(() => {
    setSearchInput(query);
    
    if (!query) {
      setResults([]);
      setTotalResults(0);
      return;
    }
    
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response: AnimeResponse = await searchAnime(query, page, 24);
        setResults(response.data);
        setTotalResults(response.pagination.items.total);
        setTotalPages(response.pagination.last_visible_page);
      } catch (error) {
        console.error('Error searching anime:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [query, page]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      searchParams.set("title", searchInput);
      searchParams.set("page", "1");
      setSearchParams(searchParams);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    searchParams.set("page", newPage.toString());
    setSearchParams(searchParams);
    window.scrollTo(0, 0);
  };
  
  return (
    <Layout>
      {/* SEO Metadata */}
      <div style={{ display: 'none' }} itemScope itemType="https://schema.org/SearchResultsPage">
        <meta itemProp="name" content={`Search Results for "${query}" - Otaku`} />
        <meta itemProp="description" content={`Browse search results for "${query}" on Otaku. Find your favorite anime shows and movies.`} />
      </div>
      
      <div className="container py-8">
        <h1 className="text-3xl font-heading font-bold mb-6">
          {query ? `Search Results for "${query}"` : "Search Anime"}
        </h1>
        
        {/* Search Form */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for anime..."
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
        
        {/* Top Ad */}
        <AdBanner className="h-[90px] mb-8" slot="search-top" />
        
        {/* Results */}
        {query && (
          <div className="mb-4">
            <p className="text-muted-foreground">
              {totalResults} results found {totalResults > 0 && `(Page ${page} of ${totalPages})`}
            </p>
          </div>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(24).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="w-full h-64 rounded-md" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {query && results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No results found for "{query}"</p>
                <p className="text-sm text-muted-foreground">Try different keywords or check for typos</p>
              </div>
            ) : (
              <AnimeGrid animes={results} showDescription />
            )}
          </>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={i}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-9 h-9 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Bottom Ad */}
        <AdBanner className="h-[90px] mt-8" slot="search-bottom" />
      </div>
    </Layout>
  );
}
