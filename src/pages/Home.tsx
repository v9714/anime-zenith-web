import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { LazyImage } from "@/components/layout/LazyImage";
import { getTopAnime, getSeasonalAnime, Anime, AnimeResponse } from "@/services/api";
import { preloadCriticalImages } from "@/lib/image-optimizer";
import { HeroSlider } from "@/components/anime/HeroSlider";  // Use regular import instead of dynamic import
import { AnimeCarousel } from "@/components/anime/AnimeCarousel";

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
    // Fetch data optimization with better error handling
    const fetchData = async () => {
      try {
        // Fetch critical data first
        const topResponse = await getTopAnime(1, 20);
        const topResults = topResponse.data;
        
        if (topResults && topResults.length > 0) {
          // Preload hero images for LCP improvement
          const criticalImages = topResults.slice(0, 5).map(
            anime => anime?.coverImage || anime?.bannerImage
          );
          preloadCriticalImages(criticalImages);
          
          // Update state for top anime
          setFeaturedAnime(topResults.slice(0, 5));
          setTopAnime(topResults.slice(5, 15));
        }
        
        // Defer less important data fetching
        if (typeof window !== 'undefined') {
          setTimeout(async () => {
            Promise.all([
              getTopAnime(2, 15),
              getSeasonalAnime()
            ]).then(([trendingResponse, seasonalResponse]) => {
              if (trendingResponse.data) setTrendingAnime(trendingResponse.data);
              if (seasonalResponse.data) setSeasonalAnime(seasonalResponse.data.slice(0, 15));
              setIsLoading(false);
            }).catch(error => {
              console.error('Error fetching secondary data:', error);
              setIsLoading(false);
            });
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSlideChange = (index: number) => {
    const header = document.querySelector('header');
    if (header) {
      header.classList.toggle('dark-bg', index > 0);
    }
  };

  // Improved skeleton with consistent dimensions
  const renderListItemSkeleton = () => (
    <div className="flex items-center gap-5 p-3 rounded-xl bg-white/5 dark:bg-black/10 shadow-lg">
      <Skeleton className="w-16 h-24 rounded-md flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );

  // Optimized skeleton with improved layout stability
  const renderSkeleton = () => (
    <>
      {/* Banner Skeleton - preset dimensions to prevent CLS */}
      <div 
        className="w-full bg-muted/30 animate-pulse" 
        style={{ 
          height: "500px",
          contain: 'layout paint' 
        }} 
        aria-label="Loading hero content"
      ></div>
      
      {/* Carousel Skeletons - fixed dimensions for layout stability */}
      <div className="container py-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col gap-2" style={{ height: "300px" }}>
              <div style={{ height: "225px" }}>
                <Skeleton className="w-full h-full rounded-md" />
              </div>
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
          {featuredAnime.length > 0 && (
            <HeroSlider 
              animes={featuredAnime} 
              onSlideChange={handleSlideChange}
            />
          )}
          
          {/* Top Anime Section with overflow styling */}
          <div>
            {topAnime.length > 0 && (
              <AnimeCarousel 
                title="Top Anime" 
                animes={topAnime} 
                link="/anime?sort=top" 
              />
            )}
          </div>
          
          {/* Sidebar Ad and Content */}
          <div className="container py-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Main Content */}
              <div className="md:w-3/4">
                {/* Trending Anime */}
                {trendingAnime.length > 0 ? (
                  <div className="mb-8">
                    <h2 className="text-xl font-heading font-bold mb-4">Trending Now</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {trendingAnime.slice(0, 8).map((anime) => (
                        <div key={anime.id} className="flex items-center gap-5 p-3 rounded-xl bg-white/5 dark:bg-black/10 hover:bg-muted/50 transition-colors shadow-lg">
                          <LazyImage 
                            src={anime?.coverImage || anime?.bannerImage}
                            alt={anime.title}
                            width="64"
                            height="96"
                            className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1">
                            <h3 className="text-base font-semibold line-clamp-2">{anime.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {anime.type} • {anime.rating ? `${anime.rating}★` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <h2 className="text-xl font-heading font-bold mb-4">Trending Now</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Array(8).fill(0).map((_, i) => (
                        <div key={i}>{renderListItemSkeleton()}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* In-content Ad */}
                <AdBanner className="h-[250px] mb-8" slot="in-content" />
                
                {/* Seasonal Anime */}
                {seasonalAnime.length > 0 ? (
                  <div>
                    <h2 className="text-xl font-heading font-bold mb-4">This Season</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {seasonalAnime.slice(0, 8).map((anime) => (
                        <div key={anime.id} className="flex items-center gap-5 p-3 rounded-xl bg-white/5 dark:bg-black/10 hover:bg-muted/50 transition-colors shadow-lg">
                          <LazyImage 
                            src={anime.coverImage || anime.bannerImage}
                            alt={anime.title}
                            width="64"
                            height="96"
                            className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1">
                            <h3 className="text-base font-semibold line-clamp-2">{anime.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {anime.type} • {anime.rating ? `${anime.rating}★` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-heading font-bold mb-4">This Season</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Array(8).fill(0).map((_, i) => (
                        <div key={i}>{renderListItemSkeleton()}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sidebar - with fixed height to avoid CLS */}
              <div className="md:w-1/4">
                <AdBanner className="h-[600px]" slot="sidebar" />
              </div>
            </div>
          </div>
          
          {/* More Recommended Anime - Deferred loading */}
          {seasonalAnime.length > 0 && (
            <AnimeCarousel 
              title="Seasonal Highlights" 
              animes={seasonalAnime.slice(0, 10)} 
              link="/seasonal" 
            />
          )}
          
          {/* Bottom Banner Ad */}
          <div className="container py-6">
            <AdBanner className="h-[90px]" slot="bottom-banner" />
          </div>
        </>
      )}
    </Layout>
  );
}
