
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState, lazy, Suspense } from "react";
import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getTopAnime, getSeasonalAnime, Anime, AnimeResponse } from "@/services/api";

// Lazy-loaded components to reduce initial JavaScript payload
const HeroSlider = lazy(() => import("@/components/anime/HeroSlider").then(mod => ({ default: mod.HeroSlider })));
const AnimeCarousel = lazy(() => import("@/components/anime/AnimeCarousel").then(mod => ({ default: mod.AnimeCarousel })));

// Ad component placeholder (for Google AdSense) - optimized to avoid layout shifts
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

export default function Home() {
  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [seasonalAnime, setSeasonalAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add compression meta tag for text resources
    const metaCompress = document.createElement('meta');
    metaCompress.name = 'Content-Encoding';
    metaCompress.content = 'gzip';
    document.head.appendChild(metaCompress);
    
    // Add cache control meta tag
    const metaCache = document.createElement('meta');
    metaCache.httpEquiv = 'Cache-Control';
    metaCache.content = 'max-age=31536000';
    document.head.appendChild(metaCache);
    
    // Use requestIdleCallback to defer non-critical operations
    const fetchData = async () => {
      try {
        const topResponse: AnimeResponse = await getTopAnime(1, 20);
        const topResults = topResponse.data;
        
        // Use first 5 anime for hero slider
        setFeaturedAnime(topResults.slice(0, 5));
        setTopAnime(topResults.slice(5, 15));
        
        // Defer less important data fetching
        window.requestIdleCallback(() => {
          Promise.all([
            getTopAnime(2, 15),
            getSeasonalAnime()
          ]).then(([trendingResponse, seasonalResponse]) => {
            setTrendingAnime(trendingResponse.data);
            setSeasonalAnime(seasonalResponse.data.slice(0, 15));
            setIsLoading(false);
          }).catch(error => {
            console.error('Error fetching secondary data:', error);
            setIsLoading(false);
          });
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Cleanup function
    return () => {
      document.head.removeChild(metaCompress);
      document.head.removeChild(metaCache);
    };
  }, []);

  const handleSlideChange = (index: number) => {
    const header = document.querySelector('header');
    if (header) {
      header.classList.toggle('dark-bg', index > 0);
    }
  };

  // Render optimized skeleton with reduced size to minimize layout shifts
  const renderSkeleton = () => (
    <>
      {/* Banner Skeleton - optimized for LCP */}
      <div className="w-full h-[500px] bg-muted/30 animate-pulse" style={{ contain: 'layout paint' }}></div>
      
      {/* Carousel Skeletons */}
      <div className="container py-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="w-full h-64 rounded-md" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <Layout>
      {isLoading ? (
        renderSkeleton()
      ) : (
        <>
          {/* SEO Metadata */}
          <div style={{ display: 'none' }} itemScope itemType="https://schema.org/WebSite">
            <meta itemProp="url" content="https://Otaku.com/" />
            <meta itemProp="name" content="Otaku - Your Ultimate Anime Streaming Platform" />
          </div>
          
          {/* Hero Slider - High priority content, optimized for LCP */}
          <Suspense fallback={<div className="w-full h-[500px] bg-muted/30" />}>
            {featuredAnime.length > 0 && (
              <HeroSlider 
                animes={featuredAnime} 
                onSlideChange={handleSlideChange}
              />
            )}
          </Suspense>
          
          {/* Top Anime Section */}
          <Suspense fallback={<div className="container py-6"><Skeleton className="h-8 w-48 mb-4" /></div>}>
            {topAnime.length > 0 && (
              <AnimeCarousel 
                title="Top Anime" 
                animes={topAnime} 
                link="/anime?sort=top" 
              />
            )}
          </Suspense>
          
          {/* Sidebar Ad and Content */}
          <div className="container py-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Main Content */}
              <div className="md:w-3/4">
                {/* Trending Anime */}
                {trendingAnime.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-heading font-bold mb-4">Trending Now</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {trendingAnime.slice(0, 8).map((anime) => (
                        <div key={anime.mal_id} className="flex items-center gap-5 p-3 rounded-xl bg-white/5 dark:bg-black/10 hover:bg-muted/50 transition-colors shadow-lg">
                          <img 
                            src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                            alt={anime.title}
                            loading="lazy"
                            width="64"
                            height="96"
                            className="w-16 h-24 object-cover rounded-md transition-all duration-200"
                            style={{
                              background: "#1A1F2C",
                              objectFit: "cover"
                            }}
                          />
                          <div>
                            <h3 className="text-base font-semibold line-clamp-2">{anime.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {anime.type} • {anime.score ? `${anime.score.toFixed(1)}★` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* In-content Ad */}
                <AdBanner className="h-[250px] mb-8" slot="in-content" />
                
                {/* Seasonal Anime */}
                {seasonalAnime.length > 0 && (
                  <div>
                    <h2 className="text-xl font-heading font-bold mb-4">This Season</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {seasonalAnime.slice(0, 8).map((anime) => (
                        <div key={anime.mal_id} className="flex items-center gap-5 p-3 rounded-xl bg-white/5 dark:bg-black/10 hover:bg-muted/50 transition-colors shadow-lg">
                          <img 
                            src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                            alt={anime.title}
                            loading="lazy"
                            width="64" 
                            height="96"
                            className="w-16 h-24 object-cover rounded-md transition-all duration-200"
                            style={{
                              background: "#1A1F2C",
                              objectFit: "cover"
                            }}
                          />
                          <div>
                            <h3 className="text-base font-semibold line-clamp-2">{anime.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {anime.type} • {anime.score ? `${anime.score.toFixed(1)}★` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="md:w-1/4">
                <AdBanner className="h-[600px]" slot="sidebar" />
              </div>
            </div>
          </div>
          
          {/* More Recommended Anime - Deferred loading */}
          <Suspense fallback={<div className="container py-6"><Skeleton className="h-8 w-64 mb-4" /></div>}>
            {seasonalAnime.length > 0 && (
              <AnimeCarousel 
                title="Seasonal Highlights" 
                animes={seasonalAnime.slice(0, 10)} 
                link="/seasonal" 
              />
            )}
          </Suspense>
          
          {/* Bottom Banner Ad */}
          <div className="container py-6">
            <AdBanner className="h-[90px]" slot="bottom-banner" />
          </div>
        </>
      )}
    </Layout>
  );
}
