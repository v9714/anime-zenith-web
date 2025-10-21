import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { getTopAnime, Anime } from "@/services/api";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { getImageUrl } from "@/utils/commanFunction";

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

// Mock episode data since the API doesn't provide actual episodes
// In a real implementation, this would come from an API
interface Episode {
  id: number;
  animeId: number;
  number: number;
  title: string;
  image: string;
  releaseDate: string;
}

export default function Episodes() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAnime = async () => {
      setIsLoading(true);
      try {
        // Fetch a list of anime to base our mock episodes on
        const response = await getTopAnime(1, 10);
        const animeList = response.data;
        setAnimes(animeList);
        
        // Generate mock episodes based on the anime we fetched
        const mockEpisodes: Episode[] = [];
        animeList.forEach(anime => {
          // For each anime, create 1-3 "latest" episodes
          const episodeCount = Math.min(3, Math.floor(Math.random() * 3) + 1);
          for (let i = 0; i < episodeCount; i++) {
            const episodeNumber = Math.floor(Math.random() * 12) + 1;
            mockEpisodes.push({
              id: mockEpisodes.length + 1,
              animeId: parseInt(anime.id),
              number: episodeNumber,
              title: `Episode ${episodeNumber}`,
              image: getImageUrl(anime.coverImage || anime.bannerImage),
              releaseDate: new Date(Date.now() - i * 86400000 * 3).toISOString().split('T')[0]
            });
          }
        });
        
        // Sort episodes by release date
        mockEpisodes.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        setEpisodes(mockEpisodes);
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnime();
  }, []);
  
  // Helper to get anime info for an episode
  const getAnimeForEpisode = (animeId: number) => {
    return animes.find(anime => parseInt(anime.id) === animeId);
  };
  
  // Format relative date
  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };
  
  return (
    <Layout>
      <SEO
        title="Latest Anime Episodes - Watch New Releases Daily"
        description="Watch the latest anime episodes released today. New episodes added daily from popular and trending anime series. Stream in HD quality."
        keywords="latest anime episodes, new anime episodes, anime releases, watch latest anime, new episodes today"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://otakutv.in/" },
          { name: "Latest Episodes", url: "https://otakutv.in/episodes" }
        ]}
      />
      
      <div className="container py-8">
        <h1 className="text-3xl font-heading font-bold mb-6">Latest Episodes</h1>
        
        {/* Top Banner Ad */}
        <AdBanner className="h-[90px] mb-8" slot="episodes-top" />
        
        {/* Episodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(9).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="w-full h-40 rounded-md" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))
          ) : (
            // Episode cards
            episodes.map(episode => {
              const anime = getAnimeForEpisode(episode.animeId);
              if (!anime) return null;
              
              return (
                <Card key={episode.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                  <Link to={`/anime/${episode.animeId}/episode/${episode.number}`} className="block">
                    <div className="relative">
                      <AspectRatio ratio={16/9}>
                        <img 
                          src={episode.image} 
                          alt={`${anime.title} Episode ${episode.number}`}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-4">
                          <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                            EP {episode.number}
                          </Badge>
                          <Badge className="bg-black/60 backdrop-blur-sm text-white border-none">
                            {getRelativeDate(episode.releaseDate)}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <div className="rounded-full bg-primary/90 p-3">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </AspectRatio>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium line-clamp-1">{anime.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Episode {episode.number} - {episode.title}
                      </p>
                    </div>
                  </Link>
                </Card>
              );
            })
          )}
        </div>
        
        {/* In-content Ad */}
        <AdBanner className="h-[250px] my-8" slot="episodes-in-content" />
        
        {/* New Releases Section */}
        <div className="mt-10">
          <h2 className="text-2xl font-heading font-bold mb-6">Coming Soon</h2>
          <p className="text-muted-foreground mb-8">
            Stay tuned for new episode releases. We update our library daily with the latest episodes.
          </p>
          
          <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
            <h3 className="font-medium mb-2">Want to get notified?</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Subscribe to get notifications when new episodes are released
            </p>
            <Link to="/notifications" className="text-primary hover:underline text-sm">
              Set Up Notifications
            </Link>
          </div>
        </div>
        
        {/* Bottom Banner Ad */}
        <AdBanner className="h-[90px] mt-8" slot="episodes-bottom" />
      </div>
    </Layout>
  );
}
