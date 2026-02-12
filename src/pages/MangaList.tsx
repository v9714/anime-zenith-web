import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { mangaService, Manga } from "@/services/mangaService";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MANGA_API_URL } from "@/utils/constants";
import { getImageUrl as getSharedImageUrl } from "@/utils/commanFunction";
import { Search, BookOpen, Sparkles, TrendingUp, Clock, Filter, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MangaPagination } from "@/components/admin/MangaPagination";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";

const MangaList = () => {
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Filter states
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("latest");
    const [searchParams, setSearchParams] = useSearchParams();
    const genreParam = searchParams.get("genre");
    const [genreFilter, setGenreFilter] = useState<string>(genreParam || "all");

    // Sync genre filter with URL param
    useEffect(() => {
        if (genreParam) {
            setGenreFilter(genreParam);
            setCurrentPage(1);
        } else {
            setGenreFilter("all");
        }
    }, [genreParam]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const itemsPerPage = 24;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchManga = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            if (debouncedSearch.trim()) {
                // Use search API when there's a search term
                response = await mangaService.searchManga(debouncedSearch, currentPage, itemsPerPage);
            } else {
                // Use regular fetch
                response = await mangaService.getAllManga(currentPage, itemsPerPage);
            }

            if (response.success) {
                let mangaData = response.data.data || [];

                // Apply client-side genre filter
                if (genreFilter !== "all") {
                    mangaData = mangaData.filter(m =>
                        m.genres?.some(mg => mg.genre.name.toLowerCase() === genreFilter.toLowerCase())
                    );
                }

                // Apply client-side status filter
                if (statusFilter !== "all") {
                    mangaData = mangaData.filter(m =>
                        m.status?.toLowerCase() === statusFilter.toLowerCase()
                    );
                }

                // Apply client-side sorting
                mangaData = sortManga(mangaData, sortBy);

                setMangas(mangaData);
                setTotalPages(response.data.meta.totalPages);
                setTotalResults(response.data.meta.total);
            }
        } catch (error) {
            console.error("Error fetching manga:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, statusFilter, sortBy, genreFilter]);

    useEffect(() => {
        fetchManga();
    }, [fetchManga]);

    const sortManga = (manga: Manga[], sort: string): Manga[] => {
        const sorted = [...manga];
        switch (sort) {
            case "latest":
                return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            case "oldest":
                return sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
            case "rating":
                return sorted.sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
            case "title":
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return sorted;
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setSortBy("latest");
        setGenreFilter("all");
        setSearchParams({});
        setCurrentPage(1);
    };

    const hasActiveFilters = searchTerm || statusFilter !== "all" || sortBy !== "latest" || genreFilter !== "all";

    const getImageUrl = (path: string | null) => {
        return getSharedImageUrl(path || undefined, MANGA_API_URL) || "/placeholder-manga.jpg";
    };

    const getStatusGradient = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'ongoing':
                return 'from-manga-neon-purple to-manga-neon-pink';
            case 'completed':
                return 'from-manga-neon-cyan to-manga-accent';
            case 'hiatus':
                return 'from-amber-500 to-orange-500';
            default:
                return 'from-manga-primary to-manga-secondary';
        }
    };

    return (
        <div className="min-h-screen bg-manga-dark text-foreground pb-12">
            {/* SEO Meta Tags */}
            <SEO
                title={genreFilter !== "all"
                    ? `${genreFilter.charAt(0).toUpperCase() + genreFilter.slice(1)} Manga - Browse Free Online`
                    : "Browse Manga - Read Free Online"
                }
                description={`Discover and read thousands of manga titles for free. ${genreFilter !== "all" ? `Browse ${genreFilter} manga. ` : ''}Filter by genre, status, and more. High quality manga reading experience.`}
                keywords={`browse manga, manga list, read manga, ${genreFilter !== "all" ? genreFilter + ' manga, ' : ''}manga online, free manga`}
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: 'https://otakutv.in' },
                    { name: 'Manga List', url: 'https://otakutv.in/manga/browse' }
                ]}
            />
            <div className="relative h-[320px] w-full overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-manga-dark via-manga-glass to-manga-dark" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-manga-primary/20 via-transparent to-transparent" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(hsl(var(--manga-neon-purple) / 0.3) 1px, transparent 1px),
                                         linear-gradient(90deg, hsl(var(--manga-neon-purple) / 0.3) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />

                {/* Floating Orbs */}
                <div className="absolute top-20 left-1/4 w-64 h-64 bg-manga-neon-purple/30 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-manga-neon-pink/20 rounded-full blur-[80px] animate-float" style={{ animationDelay: '1s' }} />

                <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-manga-neon-pink animate-neon-flicker" />
                        <span className="text-manga-neon-pink text-xs font-medium tracking-widest uppercase">Browse Collection</span>
                        <Sparkles className="w-5 h-5 text-manga-neon-pink animate-neon-flicker" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">
                        <span className="bg-gradient-to-r from-manga-neon-purple via-manga-neon-pink to-manga-neon-cyan bg-clip-text text-transparent animate-neon-flicker">
                            Otaku Tv
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-base max-w-xl mx-auto text-center">
                        Discover thousands of manga titles. Search, filter, and find your next read.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-20">
                {/* Search & Filter Bar */}
                <div className="relative max-w-5xl mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-manga-neon-purple/20 to-manga-neon-pink/20 rounded-2xl blur-xl" />
                    <div className="relative backdrop-blur-xl bg-manga-glass/60 border border-manga-neon-purple/20 rounded-2xl p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-manga-neon-purple w-5 h-5" />
                                <Input
                                    placeholder="Search manga by title..."
                                    className="pl-12 h-12 bg-manga-dark/50 border-manga-neon-purple/20 focus:border-manga-neon-pink focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground rounded-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Desktop Filters */}
                            <div className="hidden lg:flex items-center gap-3">
                                {/* Status Filter */}
                                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-[140px] h-12 bg-manga-dark/50 border-manga-neon-purple/20 rounded-xl">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-manga-dark border-manga-neon-purple/30">
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="ongoing">Ongoing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="hiatus">Hiatus</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Sort By */}
                                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-[150px] h-12 bg-manga-dark/50 border-manga-neon-purple/20 rounded-xl">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-manga-dark border-manga-neon-purple/30">
                                        <SelectItem value="latest">Latest Update</SelectItem>
                                        <SelectItem value="oldest">Oldest First</SelectItem>
                                        <SelectItem value="rating">Top Rated</SelectItem>
                                        <SelectItem value="title">Title A-Z</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Clear Filters */}
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-12 px-4 text-manga-neon-pink hover:text-manga-neon-pink hover:bg-manga-neon-pink/10 rounded-xl"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </div>

                            {/* Mobile Filter Sheet */}
                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 bg-manga-dark/50 border-manga-neon-purple/20 hover:bg-manga-neon-purple/10 rounded-xl"
                                        >
                                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                                            Filters
                                            {hasActiveFilters && (
                                                <Badge className="ml-2 bg-manga-neon-pink text-white text-xs px-1.5">
                                                    Active
                                                </Badge>
                                            )}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="bg-manga-dark border-manga-neon-purple/30 rounded-t-3xl">
                                        <SheetHeader>
                                            <SheetTitle className="text-foreground">Filter & Sort</SheetTitle>
                                        </SheetHeader>
                                        <div className="space-y-6 py-6">
                                            {/* Status */}
                                            <div>
                                                <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                    <SelectTrigger className="w-full h-12 bg-manga-glass/50 border-manga-neon-purple/20 rounded-xl">
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-manga-dark border-manga-neon-purple/30">
                                                        <SelectItem value="all">All Status</SelectItem>
                                                        <SelectItem value="ongoing">Ongoing</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="hiatus">Hiatus</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Sort */}
                                            <div>
                                                <label className="text-sm text-muted-foreground mb-2 block">Sort By</label>
                                                <Select value={sortBy} onValueChange={setSortBy}>
                                                    <SelectTrigger className="w-full h-12 bg-manga-glass/50 border-manga-neon-purple/20 rounded-xl">
                                                        <SelectValue placeholder="Sort by" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-manga-dark border-manga-neon-purple/30">
                                                        <SelectItem value="latest">Latest Update</SelectItem>
                                                        <SelectItem value="oldest">Oldest First</SelectItem>
                                                        <SelectItem value="rating">Top Rated</SelectItem>
                                                        <SelectItem value="title">Title A-Z</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={clearFilters}
                                                    className="flex-1 h-12 border-manga-neon-purple/30 rounded-xl"
                                                >
                                                    Clear All
                                                </Button>
                                                <SheetClose asChild>
                                                    <Button className="flex-1 h-12 bg-gradient-to-r from-manga-neon-purple to-manga-neon-pink text-white rounded-xl">
                                                        Apply Filters
                                                    </Button>
                                                </SheetClose>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
                    <p className="text-sm text-muted-foreground">
                        {loading ? (
                            "Loading..."
                        ) : (
                            <>
                                Showing <span className="text-manga-neon-purple font-medium">{mangas.length}</span> of{" "}
                                <span className="text-manga-neon-pink font-medium">{totalResults}</span> results
                                {debouncedSearch && (
                                    <span> for "<span className="text-foreground">{debouncedSearch}</span>"</span>
                                )}
                            </>
                        )}
                    </p>

                    {/* Active filter tags */}
                    {hasActiveFilters && (
                        <div className="hidden md:flex items-center gap-2">
                            {genreFilter !== "all" && (
                                <Badge variant="outline" className="border-manga-neon-pink/30 text-manga-neon-pink capitalize">
                                    {genreFilter}
                                    <button onClick={() => {
                                        setSearchParams((prev) => {
                                            const next = new URLSearchParams(prev);
                                            next.delete("genre");
                                            return next;
                                        });
                                    }} className="ml-1.5 hover:text-white">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            )}
                            {statusFilter !== "all" && (
                                <Badge variant="outline" className="border-manga-neon-purple/30 text-manga-neon-purple">
                                    {statusFilter}
                                    <button onClick={() => setStatusFilter("all")} className="ml-1.5 hover:text-manga-neon-pink">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            )}
                            {sortBy !== "latest" && (
                                <Badge variant="outline" className="border-manga-neon-cyan/30 text-manga-neon-cyan">
                                    {sortBy === "rating" ? "Top Rated" : sortBy === "title" ? "A-Z" : "Oldest"}
                                    <button onClick={() => setSortBy("latest")} className="ml-1.5 hover:text-manga-neon-pink">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-manga-neon-purple/30 rounded-full" />
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-manga-neon-pink rounded-full animate-spin" />
                        </div>
                        <p className="text-muted-foreground mt-6 animate-pulse">Loading manga universe...</p>
                    </div>
                ) : mangas.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {mangas.map((manga, index) => (
                            <Link
                                key={manga.id}
                                to={`/manga/${manga.id}`}
                                className="group animate-fade-in"
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                {/* Glassmorphism Card */}
                                <div className="relative overflow-hidden rounded-xl md:rounded-2xl transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                                    {/* Glowing Border Effect */}
                                    <div className="absolute -inset-[1px] rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-manga-neon-purple via-manga-neon-pink to-manga-neon-cyan transition-opacity duration-300 blur-sm" />

                                    {/* Card Content */}
                                    <div className="relative backdrop-blur-sm bg-manga-glass/60 rounded-xl md:rounded-2xl overflow-hidden border border-manga-neon-purple/10 group-hover:border-transparent">
                                        {/* Cover Image */}
                                        <div className="relative aspect-[3/4] overflow-hidden">
                                            <img
                                                src={getImageUrl(manga.coverImage)}
                                                alt={manga.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                loading="lazy"
                                            />

                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-manga-dark via-manga-dark/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                            {/* Hover Read Button */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="px-3 py-1.5 md:px-4 md:py-2 bg-manga-neon-purple/90 backdrop-blur-sm rounded-full flex items-center gap-1.5 md:gap-2 text-white text-sm font-medium shadow-lg shadow-manga-neon-purple/30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    Read Now
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            {manga.status && (
                                                <Badge className={`
                                                    absolute top-2 right-2 md:top-3 md:right-3
                                                    bg-gradient-to-r ${getStatusGradient(manga.status)}
                                                    text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 md:px-2.5 md:py-1
                                                    border-none shadow-lg
                                                `}>
                                                    {manga.status}
                                                </Badge>
                                            )}

                                            {/* Rating Badge */}
                                            {manga.rating && parseFloat(manga.rating) > 0 && (
                                                <div className="absolute top-2 left-2 md:top-3 md:left-3 flex items-center gap-1 bg-manga-dark/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                                                    <span className="text-yellow-400 text-xs">★</span>
                                                    <span className="text-white text-[10px] font-medium">{parseFloat(manga.rating).toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Info */}
                                        <div className="p-3 md:p-4 bg-gradient-to-t from-manga-dark to-manga-glass/80">
                                            <h3 className="font-bold text-xs md:text-sm line-clamp-1 text-foreground group-hover:text-manga-neon-pink transition-colors duration-300">
                                                {manga.title}
                                            </h3>
                                            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 line-clamp-1 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-manga-neon-purple" />
                                                {manga.author || "Unknown Author"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-manga-glass border border-manga-neon-purple/20 mb-6">
                            <Search className="w-8 h-8 text-manga-neon-purple" />
                        </div>
                        <p className="text-foreground text-lg font-medium mb-2">No manga found</p>
                        <p className="text-muted-foreground">
                            {debouncedSearch
                                ? `No results for "${debouncedSearch}". Try a different search.`
                                : "Try adjusting your filters to find more manga."
                            }
                        </p>
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="mt-4 border-manga-neon-purple/30 hover:bg-manga-neon-purple/10"
                            >
                                Clear all filters
                            </Button>
                        )}
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && mangas.length > 0 && totalPages > 1 && (
                    <div className="mt-12">
                        <MangaPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MangaList;
