
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Film,
  Info,
  Play,
  Star
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { AnimeCarousel } from "@/components/anime/AnimeCarousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getAnimeById, getAnimeRecommendations, Anime } from "@/services/api";
import { getImageUrl } from "@/utils/commanFunction";
import EpisodesTab from "@/components/anime/details/EpisodesTab";
import CharactersTab from "@/components/anime/details/CharactersTab";

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

export default function AnimeDetails() {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        // Fetch anime details
        const response = await getAnimeById(parseInt(id));
        setAnime(response.data);

        // Fetch recommendations
        const recsResponse = await getAnimeRecommendations(parseInt(id));
        if (recsResponse.data && Array.isArray(recsResponse.data)) {
          // Extract the actual anime objects from recommendations
          const recommendedAnimes = recsResponse.data
            .slice(0, 12)
            .map(rec => rec.entry)
            .filter(Boolean);

          setRecommendations(recommendedAnimes);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching anime details:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Function to render meta data items
  const renderMetaItem = (icon: React.ReactNode, label: string, value: string | number | null) => {
    if (!value) return null;

    return (
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-full md:w-1/4 h-[400px] rounded-md" />
            <div className="w-full md:w-3/4 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-2 py-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!anime) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Anime Not Found</h1>
          <p className="text-muted-foreground mb-8">The anime you're looking for couldn't be found or doesn't exist.</p>
          <Button asChild>
            <Link to="/anime">Browse Anime</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // SEO Schema.org structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": anime.title,
    "alternateName": anime.alternativeTitles,
    "image": anime.bannerImage || anime.coverImage,
    "description": anime.description,
    "datePublished": anime.year?.toString(),
    "genre": anime.genres?.map(g => g.name)
  };

  return (
    <Layout>
      {/* Structured Data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Background Banner */}
      <div className="relative w-full h-[300px] overflow-hidden mb-8">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(anime.bannerImage || anime.coverImage)}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container -mt-40 relative z-10 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar with Poster and Metadata */}
          <div className="w-full md:w-1/4 flex flex-col gap-6">
            {/* Poster */}
            <div>
              <img
                src={getImageUrl(anime.coverImage || anime.bannerImage)}
                alt={anime.title}
                className="w-full max-w-[300px] md:max-w-full rounded-md shadow-lg mx-auto md:mx-0"
              />

              <div className="flex justify-center gap-2 mt-4">
                <Button asChild className="flex-1 rounded-full">
                  <Link to={`/watch/${anime.id}`} className="flex items-center justify-center gap-1">
                    <Play className="h-4 w-4" />
                    <span>Watch</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Anime Info</span>
              </h3>

              <div className="grid gap-4">
                {renderMetaItem(
                  <Film className="h-4 w-4 text-muted-foreground" />,
                  "Type",
                  anime.type
                )}

                {renderMetaItem(
                  <Calendar className="h-4 w-4 text-muted-foreground" />,
                  "Year",
                  anime.year
                )}

                {renderMetaItem(
                  <Clock className="h-4 w-4 text-muted-foreground" />,
                  "Status",
                  anime.status
                )}

                {renderMetaItem(
                  <Star className="h-4 w-4 text-muted-foreground" />,
                  "Rating",
                  anime.rating
                )}

                {renderMetaItem(
                  <Clock className="h-4 w-4 text-muted-foreground" />,
                  "Duration",
                  anime.episodeDuration
                )}

                {renderMetaItem(
                  <Film className="h-4 w-4 text-muted-foreground" />,
                  "Studio",
                  anime.studio
                )}
              </div>
            </div>

            {/* Sidebar Ad */}
            <AdBanner className="h-[250px]" slot="details-sidebar" />
          </div>

          {/* Main Details */}
          <div className="w-full md:w-3/4">
            {/* Top Banner Ad */}
            <AdBanner className="h-[90px] mb-6" slot="details-top" />

            <h1 className="text-3xl font-heading font-bold">{anime.title}</h1>
            {anime.alternativeTitles?.map((title, index) => (
              title !== anime.title && (
                <p
                  key={index}
                  className={`text-muted-foreground mt-1 ${index === 0 ? 'text-xl' : 'text-sm'}`}
                >
                  {title}
                </p>
              )
            ))}


            {/* Rating and Status */}
            <div className="flex flex-wrap gap-2 mt-4">
              {anime.status && (
                <Badge variant="outline">
                  {anime.status}
                </Badge>
              )}

              {anime.rating && (
                <Badge variant="secondary">
                  {anime.rating}
                </Badge>
              )}

              {anime.year && (
                <Badge className="bg-primary/10 text-primary">
                  {anime.year}
                </Badge>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mt-4">
              {anime.genres?.map((genre, inx) => (
                <Link key={inx} to={`/genre/${genre.mal_id}`}>
                  <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                    {genre.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Tabs for Details, Episodes, etc. */}
            <Tabs defaultValue="synopsis" className="mt-8">
              <TabsList className="mb-4">
                <TabsTrigger value="synopsis">Synopsis</TabsTrigger>
                <TabsTrigger value="episodes">Episodes</TabsTrigger>
                <TabsTrigger value="characters">Characters</TabsTrigger>
              </TabsList>

              <TabsContent value="synopsis" className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {anime.description || "No synopsis available."}
                </p>

                {/* In-content Ad */}
                <AdBanner className="h-[250px] my-6" slot="details-in-content" />
              </TabsContent>

              <TabsContent value="episodes">
                <EpisodesTab animeId={anime.id} defaultSeason={(anime as any)?.season} />
              </TabsContent>

              <TabsContent value="characters">
                <CharactersTab animeTitle={anime.title} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Recommended Anime */}
      {recommendations && recommendations.length > 0 && (
        <div className="py-8 border-t">
          <AnimeCarousel
            title="You May Also Like"
            animes={recommendations}
          />
        </div>
      )}

      {/* Bottom Banner Ad */}
      <div className="container py-6">
        <AdBanner className="h-[90px]" slot="details-bottom" />
      </div>
    </Layout>
  );
}
