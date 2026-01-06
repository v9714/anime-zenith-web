import { useEffect, useState } from 'react';
import { Flame, Clock, BookOpen, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { MangaHero } from '@/components/manga/MangaHero';
import { MangaSection } from '@/components/manga/MangaSection';
import { MangaCarousel } from '@/components/manga/MangaCarousel';
import { MangaGrid } from '@/components/manga/MangaGrid';
import { SEO } from '@/components/SEO';
import { mangaService, Manga } from '@/services/mangaService';

export default function MangaHome() {
    const [topManga, setTopManga] = useState<Manga[]>([]);
    const [popularManga, setPopularManga] = useState<Manga[]>([]);
    const [latestManga, setLatestManga] = useState<Manga[]>([]);
    const [recentManga, setRecentManga] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMangaData = async () => {
            try {
                setLoading(true);
                // Fetch different categories
                // For now, we'll use the same API endpoint and split the data
                // You can modify this to use different API endpoints when they're available
                const [topResponse, popularResponse, latestResponse, recentResponse] = await Promise.all([
                    mangaService.getAllManga(1, 5),
                    mangaService.getAllManga(1, 20),
                    mangaService.getAllManga(1, 20),
                    mangaService.getAllManga(1, 15),
                ]);

                if (topResponse.success) {
                    setTopManga(topResponse.data.data.slice(0, 5));
                }
                if (popularResponse.success) {
                    setPopularManga(popularResponse.data.data);
                }
                if (latestResponse.success) {
                    setLatestManga(latestResponse.data.data);
                }
                if (recentResponse.success) {
                    setRecentManga(recentResponse.data.data);
                }
            } catch (error) {
                console.error('Error fetching manga data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMangaData();
    }, []);

    return (
        <Layout>
            <SEO
                title="MangaVerse - Read Manga Online Free"
                description="Discover and read thousands of manga titles for free. Latest updates, popular series, and new releases - all in one place."
            />

            {/* Hero Section - Full bleed above container */}
            <div className="-mt-16">
                <MangaHero manga={topManga} />
            </div>

            <div className="container mx-auto px-4 pb-16 space-y-8">
                {/* Popular Section */}
                <MangaSection
                    title="Popular Now"
                    subtitle="Most followed manga this week"
                    icon={<Flame className="w-5 h-5 text-manga-secondary" />}
                    viewAllLink="/manga"
                >
                    <MangaCarousel
                        manga={popularManga}
                        loading={loading}
                        variant="featured"
                    />
                </MangaSection>

                {/* Latest Updates */}
                <MangaSection
                    title="Latest Updates"
                    subtitle="Fresh chapters just dropped"
                    icon={<Clock className="w-5 h-5 text-manga-accent" />}
                    viewAllLink="/manga"
                >
                    <MangaCarousel
                        manga={latestManga}
                        loading={loading}
                    />
                </MangaSection>

                {/* Recently Added */}
                <MangaSection
                    title="New Arrivals"
                    subtitle="Recently added to our library"
                    icon={<Sparkles className="w-5 h-5 text-manga-neon-cyan" />}
                    viewAllLink="/manga"
                >
                    <MangaGrid
                        manga={recentManga}
                        loading={loading}
                        columns={5}
                    />
                </MangaSection>

                {/* Stats Banner with Cyberpunk Styling */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-manga-primary/10 via-manga-secondary/10 to-manga-accent/10 border border-manga-primary/20 p-8 my-12">
                    <div className="absolute inset-0 bg-grid-white/5" />
                    <div className="relative flex flex-col md:flex-row items-center justify-around gap-8 text-center">
                        <div className="space-y-2">
                            <div className="text-4xl font-bold bg-gradient-to-r from-manga-primary to-manga-secondary bg-clip-text text-transparent">100K+</div>
                            <div className="text-muted-foreground">Manga Titles</div>
                        </div>
                        <div className="hidden md:block w-px h-16 bg-manga-primary/30" />
                        <div className="space-y-2">
                            <div className="text-4xl font-bold bg-gradient-to-r from-manga-secondary to-manga-accent bg-clip-text text-transparent">1M+</div>
                            <div className="text-muted-foreground">Chapters</div>
                        </div>
                        <div className="hidden md:block w-px h-16 bg-manga-primary/30" />
                        <div className="space-y-2">
                            <div className="text-4xl font-bold bg-gradient-to-r from-manga-accent to-manga-neon-cyan bg-clip-text text-transparent">Free</div>
                            <div className="text-muted-foreground">Forever</div>
                        </div>
                    </div>

                    {/* Decorative Glows */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-manga-primary/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-manga-accent/20 rounded-full blur-3xl" />
                </div>

                {/* Explore Genres */}
                <MangaSection
                    title="Explore Genres"
                    subtitle="Find your next favorite manga"
                    icon={<BookOpen className="w-5 h-5 text-manga-neon-purple" />}
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
                                className="group relative overflow-hidden rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-manga-primary/20"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                <span className="relative font-semibold text-white text-lg drop-shadow-lg">{genre.name}</span>
                            </a>
                        ))}
                    </div>
                </MangaSection>
            </div>
        </Layout>
    );
}
