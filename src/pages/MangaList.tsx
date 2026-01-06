import React, { useEffect, useState } from "react";
import { mangaService, Manga } from "@/services/mangaService";
import { Search, Flame, Clock, Sparkles, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MangaPagination } from "@/components/admin/MangaPagination";
import { MangaHeroLocal } from "@/components/manga/MangaHeroLocal";
import { MangaSection } from "@/components/manga/MangaSection";
import { MangaCarouselLocal } from "@/components/manga/MangaCarouselLocal";
import { MangaGridLocal } from "@/components/manga/MangaGridLocal";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";

const MangaList = () => {
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchManga = async () => {
            try {
                setLoading(true);
                const response = await mangaService.getAllManga(currentPage, itemsPerPage);
                if (response.success) {
                    setMangas(response.data.data || []);
                    setTotalPages(response.data.meta.totalPages);
                }
            } catch (error) {
                console.error("Error fetching manga:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchManga();
    }, [currentPage]);

    const filteredManga = mangas?.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Split manga for different sections (when not searching)
    const featuredManga = mangas.slice(0, 5);
    const popularManga = mangas.slice(0, 10);
    const latestManga = mangas.slice(5, 15);
    const newArrivals = mangas.slice(10, 20);

    const isSearching = searchTerm.length > 0;

    return (
        <Layout>
            <SEO 
                title="MangaVerse - Read Manga Online Free"
                description="Discover and read thousands of manga titles for free. Latest updates, popular series, and new releases - all in one place."
            />

            {/* Hero Section - Full bleed above container */}
            {!isSearching && (
                <div className="-mt-16">
                    <MangaHeroLocal manga={featuredManga} />
                </div>
            )}

            <div className="container mx-auto px-4 pb-16 space-y-8">
                {/* Search Bar */}
                <div className={`relative max-w-2xl mx-auto ${isSearching ? 'pt-8' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-manga-accent/20 rounded-2xl blur-xl" />
                    <div className="relative backdrop-blur-xl bg-card/50 border border-primary/20 rounded-2xl p-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                            <Input
                                placeholder="Search manga by title or author..."
                                className="pl-12 h-14 bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground text-lg rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Show sections or search results */}
                {isSearching ? (
                    /* Search Results */
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">
                            Search Results for "{searchTerm}"
                        </h2>
                        <MangaGridLocal 
                            manga={filteredManga}
                            loading={loading}
                            columns={5}
                        />
                    </div>
                ) : (
                    /* Home Sections */
                    <>
                        {/* Popular Section */}
                        <MangaSection
                            title="Popular Now"
                            subtitle="Most read manga this week"
                            icon={<Flame className="w-5 h-5 text-orange-500" />}
                            viewAllLink="/manga"
                        >
                            <MangaCarouselLocal 
                                manga={popularManga}
                                loading={loading}
                                variant="featured"
                            />
                        </MangaSection>

                        {/* Latest Updates */}
                        <MangaSection
                            title="Latest Updates"
                            subtitle="Fresh chapters just dropped"
                            icon={<Clock className="w-5 h-5 text-blue-500" />}
                            viewAllLink="/manga"
                        >
                            <MangaCarouselLocal 
                                manga={latestManga}
                                loading={loading}
                            />
                        </MangaSection>

                        {/* New Arrivals */}
                        <MangaSection
                            title="New Arrivals"
                            subtitle="Recently added to our library"
                            icon={<Sparkles className="w-5 h-5 text-purple-500" />}
                            viewAllLink="/manga"
                        >
                            <MangaGridLocal 
                                manga={newArrivals}
                                loading={loading}
                                columns={5}
                            />
                        </MangaSection>

                        {/* Stats Banner with Cyberpunk Styling */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-manga-secondary/10 to-manga-accent/10 border border-primary/20 p-8 my-12">
                            <div className="absolute inset-0 bg-grid-white/5" />
                            <div className="relative flex flex-col md:flex-row items-center justify-around gap-8 text-center">
                                <div className="space-y-2">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">{mangas.length}+</div>
                                    <div className="text-muted-foreground">Manga Titles</div>
                                </div>
                                <div className="hidden md:block w-px h-16 bg-primary/30" />
                                <div className="space-y-2">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">1K+</div>
                                    <div className="text-muted-foreground">Chapters</div>
                                </div>
                                <div className="hidden md:block w-px h-16 bg-primary/30" />
                                <div className="space-y-2">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Free</div>
                                    <div className="text-muted-foreground">Forever</div>
                                </div>
                            </div>
                            
                            {/* Decorative Glows */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                        </div>

                        {/* Explore Genres */}
                        <MangaSection
                            title="Explore Genres"
                            subtitle="Find your next favorite manga"
                            icon={<BookOpen className="w-5 h-5 text-cyan-500" />}
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {[
                                    { name: 'Action', color: 'from-red-500 to-orange-500' },
                                    { name: 'Romance', color: 'from-pink-500 to-rose-500' },
                                    { name: 'Fantasy', color: 'from-purple-500 to-indigo-500' },
                                    { name: 'Comedy', color: 'from-yellow-500 to-amber-500' },
                                    { name: 'Drama', color: 'from-blue-500 to-cyan-500' },
                                    { name: 'Horror', color: 'from-gray-700 to-gray-900' },
                                ].map((genre) => (
                                    <a
                                        key={genre.name}
                                        href={`/manga?genre=${genre.name.toLowerCase()}`}
                                        className="group relative overflow-hidden rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                        <span className="relative font-semibold text-white text-lg drop-shadow-lg">{genre.name}</span>
                                    </a>
                                ))}
                            </div>
                        </MangaSection>
                    </>
                )}

                {/* Pagination - Always show */}
                {!loading && mangas.length > 0 && (
                    <MangaPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </Layout>
    );
};

export default MangaList;