
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { HeroSlider } from "@/components/anime/HeroSlider";
import { AnimeCarousel } from "@/components/anime/AnimeCarousel";
import { getTopAnime, getSeasonalAnime, Anime, AnimeResponse } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

const AdBanner = ({ className = "", label }: { className?: string; label?: string }) => {
  useEffect(() => {
    // Check if the AdSense script is already added
    const existingScript = document.querySelector(
      'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9858886039044072";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Try to push the ad
    try {
      // @ts-expect-error
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("Adsbygoogle push error:", err);
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      {label && <div className="text-xs text-muted-foreground text-center mb-1">Ad: {label}</div>}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9858886039044072"
        data-ad-slot="5125181623"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default function Home() {
  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [seasonalAnime, setSeasonalAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topResponse: AnimeResponse = await getTopAnime(1, 20);
        const topResults = topResponse.data;
        
        // Use first 5 anime for hero slider
        setFeaturedAnime(topResults.slice(0, 5));
        setTopAnime(topResults.slice(5, 15));
        
        const trendingResponse: AnimeResponse = await getTopAnime(2, 15);
        setTrendingAnime(trendingResponse.data);
        
        const seasonalResponse: AnimeResponse = await getSeasonalAnime();
        setSeasonalAnime(seasonalResponse.data.slice(0, 15));
        
        setIsLoading(false);
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

  const renderSkeleton = () => (
    <>
      {/* Banner Skeleton */}
      <div className="w-full h-[500px] bg-muted/30 animate-pulse"></div>
      
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
          
          {/* Hero Slider */}
          {featuredAnime.length > 0 && (
            <HeroSlider 
              animes={featuredAnime} 
              onSlideChange={handleSlideChange}
            />
          )}
          
          {/* Top Anime Section */}
          {topAnime.length > 0 && (
            <AnimeCarousel 
              title="Top Anime" 
              animes={topAnime} 
              link="/anime?sort=top" 
            />
          )}
          
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
                            className="w-28 h-40 sm:w-32 sm:h-48 object-cover rounded-lg shadow-2xl border-2 border-white/10"
                            loading="lazy"
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
                {/* <AdBanner className="h-[250px] mb-8" slot="in-content" /> */}
                
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
                            className="w-28 h-40 sm:w-32 sm:h-48 object-cover rounded-lg shadow-2xl border-2 border-white/10"
                            loading="lazy"
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
                {/* <AdBanner className="h-[600px]" slot="sidebar" /> */}
              </div>
            </div>
          </div>
          
          {/* More Recommended Anime */}
          {seasonalAnime.length > 0 && (
            <AnimeCarousel 
              title="Seasonal Highlights" 
              animes={seasonalAnime.slice(0, 10)} 
              link="/seasonal" 
            />
          )}
          
          {/* Bottom Banner Ad */}
          <div className="container py-6">
            {/* <AdBanner className="h-[90px]" slot="bottom-banner" /> */}
            <AdBanner className="h-[90px]" label="bottom-banner" />
          </div>
        </>
      )}
    </Layout>
  );
}
