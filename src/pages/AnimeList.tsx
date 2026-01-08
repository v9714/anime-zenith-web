import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AnimeGrid } from "@/components/anime/AnimeGrid";
import { getTopAnime, getAnimeGenres, getAnimeByGenre, Anime } from "@/services/api";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

export default function AnimeList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const page = parseInt(searchParams.get("page") || "1");
  const genre = searchParams.get("genre") || "";
  const sort = searchParams.get("sort") || "top";

  useEffect(() => {
    // Fetch available genres
    const fetchGenres = async () => {
      try {
        const response = await getAnimeGenres();
        if (response.data) {
          setGenres(response.data);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchAnime = async () => {
      setIsLoading(true);
      try {
        let response;

        if (genre) {
          // Fetch anime by genre
          response = await getAnimeByGenre(parseInt(genre), page);
        } else {
          // Fetch top anime
          response = await getTopAnime(page, 24);
        }

        if (response.data) {
          setAnimes(response.data);
          setTotalPages(response.pagination?.last_visible_page || 1);
        }
      } catch (error) {
        console.error('Error fetching anime list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnime();
  }, [page, genre, sort]);

  const handlePageChange = (newPage: number) => {
    searchParams.set("page", newPage.toString());
    setSearchParams(searchParams);
    window.scrollTo(0, 0);
  };

  const handleGenreChange = (value: string) => {
    if (value && value !== "all") {
      searchParams.set("genre", value);
    } else {
      searchParams.delete("genre");
    }
    searchParams.set("page", "1");
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    searchParams.delete("genre");
    searchParams.delete("sort");
    searchParams.set("page", "1");
    setSearchParams(searchParams);
  };

  const handleSortChange = (value: string) => {
    searchParams.set("sort", value);
    searchParams.set("page", "1");
    setSearchParams(searchParams);
  };

  const selectedGenre = genres.find(g => g.id.toString() === genre);
  const pageTitle = selectedGenre
    ? `${selectedGenre.name} Anime - Browse ${selectedGenre.name} Series & Movies`
    : "Browse All Anime Series & Movies - Complete Collection";
  const pageDescription = selectedGenre
    ? `Discover the best ${selectedGenre.name} anime series and movies. Browse our extensive collection of ${selectedGenre.name} anime, sorted by popularity and rating.`
    : "Browse our complete collection of anime series and movies. Filter by genre, sort by popularity, rating, or title. Discover your next favorite anime.";

  return (
    <Layout>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={`anime list, browse anime, ${selectedGenre?.name || 'all'} anime, anime series, anime movies, anime by genre`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://otakutv.in/" },
          { name: "Anime List", url: "https://otakutv.in/anime" }
        ]}
      />

      <div className="container py-8">
        <h1 className="text-3xl font-heading font-bold mb-6">Anime List</h1>

        {/* Top Banner Ad */}
        <AdBanner className="h-[90px] mb-8" slot="list-top" />

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="w-full sm:w-auto">
                <Select value={genre || "all"} onValueChange={handleGenreChange}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((g, inx) => (
                      <SelectItem key={g.id ?? inx} value={g.id?.toString()}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Popularity</SelectItem>
                    <SelectItem value="score">Rating</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(genre || sort !== "top") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Pagination Info */}
          <div className="text-muted-foreground text-sm flex items-center">
            Page {page} of {totalPages}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          <div className="w-full">
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
              <AnimeGrid animes={animes} />
            )}

            {/* Pagination */}
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
          </div>
        </div>

        {/* Bottom Ad */}
        <AdBanner className="h-[90px] mt-8" slot="list-bottom" />
      </div>
    </Layout>
  );
}
