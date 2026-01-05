import { Flame, Clock, TrendingUp, BookOpen, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { MangaHero } from '@/components/manga/MangaHero';
import { MangaSection } from '@/components/manga/MangaSection';
import { MangaCarousel } from '@/components/manga/MangaCarousel';
import { MangaGrid } from '@/components/manga/MangaGrid';
import { usePopularManga, useLatestUpdates, useRecentlyAdded } from '@/hooks/useMangaDex';
import { SEO } from '@/components/SEO';

export default function MangaHome() {
  const { data: popularData, isLoading: loadingPopular } = usePopularManga(20);
  const { data: latestData, isLoading: loadingLatest } = useLatestUpdates(20);
  const { data: recentData, isLoading: loadingRecent } = useRecentlyAdded(15);

  const popularManga = popularData?.data || [];
  const latestManga = latestData?.data || [];
  const recentManga = recentData?.data || [];

  return (
    <Layout>
      <SEO 
        title="MangaVerse - Read Manga Online Free"
        description="Discover and read thousands of manga titles for free. Latest updates, popular series, and new releases - all in one place."
      />

      {/* Hero Section */}
      <MangaHero manga={popularManga.slice(0, 5)} />

      <div className="container mx-auto px-4 pb-16 space-y-4">
        {/* Popular Section */}
        <MangaSection
          title="Popular Now"
          subtitle="Most followed manga this week"
          icon={<Flame className="w-5 h-5" />}
          viewAllLink="/browse?sort=popular"
        >
          <MangaCarousel 
            manga={popularManga}
            loading={loadingPopular}
            variant="featured"
          />
        </MangaSection>

        {/* Latest Updates */}
        <MangaSection
          title="Latest Updates"
          subtitle="Fresh chapters just dropped"
          icon={<Clock className="w-5 h-5" />}
          viewAllLink="/browse?sort=latest"
        >
          <MangaCarousel 
            manga={latestManga}
            loading={loadingLatest}
          />
        </MangaSection>

        {/* Recently Added */}
        <MangaSection
          title="New Arrivals"
          subtitle="Recently added to our library"
          icon={<Sparkles className="w-5 h-5" />}
          viewAllLink="/browse?sort=recent"
        >
          <MangaGrid 
            manga={recentManga}
            loading={loadingRecent}
            columns={5}
          />
        </MangaSection>

        {/* Stats Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-manga-secondary/10 to-manga-accent/10 border border-primary/20 p-8 my-12">
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="relative flex flex-col md:flex-row items-center justify-around gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">100K+</div>
              <div className="text-muted-foreground">Manga Titles</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-border" />
            <div className="space-y-2">
              <div className="text-4xl font-bold text-manga-secondary">1M+</div>
              <div className="text-muted-foreground">Chapters</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-border" />
            <div className="space-y-2">
              <div className="text-4xl font-bold text-manga-accent">Free</div>
              <div className="text-muted-foreground">Forever</div>
            </div>
          </div>
          
          {/* Decorative */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-manga-accent/20 rounded-full blur-3xl" />
        </div>

        {/* Trending by Genre - Quick Links */}
        <MangaSection
          title="Explore Genres"
          subtitle="Find your next favorite manga"
          icon={<BookOpen className="w-5 h-5" />}
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
                href={`/browse?genre=${genre.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-xl p-6 text-center transition-transform hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <span className="relative font-semibold text-white text-lg">{genre.name}</span>
              </a>
            ))}
          </div>
        </MangaSection>
      </div>
    </Layout>
  );
}
