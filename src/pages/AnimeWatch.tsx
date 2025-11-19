/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { SEO, BreadcrumbSchema, VideoSchema } from "@/components/SEO";
import { Star, Play, Heart, Share, SkipBack, SkipForward, List, Info, ThumbsUp, BookmarkPlus, Search, Eye } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";
import { useToast } from "@/hooks/use-toast";
import { getAnimeById, getAnimeEpisodesBySeason, Anime, Episode } from "@/services/api";
import { BACKEND_API_Image_URL } from "@/utils/constants";

// Import components
import { EpisodeList } from "@/components/anime/watch/EpisodeList";
import { AnimeInfoCard } from "@/components/anime/watch/AnimeInfoCard";
import { CommentsSection } from "@/components/anime/watch/CommentsSection";
import { MostPopularSidebar } from "@/components/anime/watch/MostPopularSidebar";
import VideoPlayer from "@/components/anime/watch/VideoPlayer";
import { SeasonsSection } from "@/components/anime/watch/SeasonsSection";
import { getImageUrl } from "@/utils/commanFunction";

// Dummy popular anime data
const popularAnime = [
  { title: "One Piece", episodes: 1122, img: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", id: 1, rating: 8.9 },
  { title: "Naruto: Shippuden", episodes: 500, img: "https://cdn.myanimelist.net/images/anime/5/17407.jpg", id: 2, rating: 8.7 },
  { title: "Bleach", episodes: 366, img: "https://cdn.myanimelist.net/images/anime/3/40451.jpg", id: 3, rating: 8.2 },
  { title: "Solo Leveling Season 2", episodes: 12, img: "https://cdn.myanimelist.net/images/anime/1734/142860.jpg", id: 4, rating: 9.1 },
  { title: "Black Clover", episodes: 170, img: "https://cdn.myanimelist.net/images/anime/2/88336.jpg", id: 5, rating: 8.4 }
];

export default function AnimeWatch() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const animeId = parseInt(id || "0");
  const { updateWatchHistory, currentUser } = useAuth();
  const { pauseBackgroundMusic, resumeBackgroundMusic } = useAudio();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Decode URL parameters (obfuscated for security)
  const encParam = searchParams.get('v'); // encoded video/episode data
  const decodeParams = (encoded: string | null): { episodeNumber: number; episodeId: number | null } => {
    if (!encoded) return { episodeNumber: 1, episodeId: null };
    try {
      // Decode from base64
      const decoded = atob(encoded);
      const [ep, eid] = decoded.split(':');
      return {
        episodeNumber: parseInt(ep) || 1,
        episodeId: eid ? parseInt(eid) : null
      };
    } catch {
      return { episodeNumber: 1, episodeId: null };
    }
  };

  const { episodeNumber, episodeId: episodeIdFromUrl } = decodeParams(encParam);

  // State management
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSeason, setCurrentSeason] = useState<string>('spring');
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState(0);
  const [watchedEpisodes, setWatchedEpisodes] = useState<number[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");
  const [currentThumbnail, setCurrentThumbnail] = useState<string>("");

  // Pause background music when entering watch page
  useEffect(() => {
    pauseBackgroundMusic();

    return () => {
      // Resume background music when leaving watch page
      resumeBackgroundMusic();
    };
  }, [pauseBackgroundMusic, resumeBackgroundMusic]);

  // Fetch anime and episode data ONLY ONCE on mount or when anime ID changes
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch anime details
        const animeResponse = await getAnimeById(parseInt(id));
        setAnime(animeResponse.data);

        // Fetch episodes for the current season (ONLY ONCE)
        const episodesResponse = await getAnimeEpisodesBySeason(id);
        if (episodesResponse?.success) {
          setEpisodes(episodesResponse.data || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentSeason]); // Only re-fetch when anime ID or season changes

  // Separate effect to handle URL params and set active episode (NO API CALLS)
  useEffect(() => {
    if (episodes.length === 0) return;

    let targetIndex = 0;

    // Set active episode based on URL params (prioritize episodeId, then episodeNumber)
    if (episodeIdFromUrl) {
      const foundIndex = episodes.findIndex((ep: Episode) => ep.id === episodeIdFromUrl);
      targetIndex = foundIndex >= 0 ? foundIndex : 0;
    } else if (encParam && episodeNumber) {
      const foundIndex = episodes.findIndex((ep: Episode) => ep.episodeNumber === episodeNumber);
      targetIndex = foundIndex >= 0 ? foundIndex : 0;
    }

    // Only update if the episode actually changed
    if (targetIndex !== activeEpisode || !currentVideoUrl) {
      setActiveEpisode(targetIndex);

      // Update video URLs
      const episode = episodes[targetIndex];
      if (episode?.masterUrl) {
        const newVideoUrl = `${BACKEND_API_Image_URL}${episode.masterUrl}`;
        const newThumbnail = `${BACKEND_API_Image_URL}${episode.thumbnail}`;

        // Batch state updates to prevent multiple re-renders
        setCurrentVideoUrl(newVideoUrl);
        setCurrentThumbnail(newThumbnail);
      }
    }
  }, [episodes, encParam, episodeNumber, episodeIdFromUrl]);

  // Get current episode data
  const getCurrentEpisode = () => {
    if (episodes.length > 0 && episodes[activeEpisode]) {
      return episodes[activeEpisode];
    }
    return null;
  };

  // Get episode titles for EpisodeList component
  const episodeTitles = episodes.map(ep => ep.title || `Episode ${ep.episodeNumber}`);

  // Get video URL and thumbnail based on current episode
  const getVideoUrl = () => {
    if (currentVideoUrl) return currentVideoUrl;
    const currentEpisode = getCurrentEpisode();
    if (currentEpisode?.masterUrl) {
      return `${BACKEND_API_Image_URL}${currentEpisode.masterUrl}`;
    }
    return "";
  };

  const getThumbnailUrl = () => {
    if (currentThumbnail) return currentThumbnail;
    const currentEpisode = getCurrentEpisode();
    if (currentEpisode?.thumbnail) {
      return `${BACKEND_API_Image_URL}${currentEpisode.thumbnail}`;
    }
    return "";
  };

  // Record watch history when component mounts
  useEffect(() => {
    if (!animeId || !getVideoUrl()) {
      return;
    }

    if (anime) {
      updateWatchHistory({
        animeId: animeId,
        title: anime.title,
        imageUrl: anime.coverImage || "",
        episodeNumber: episodeNumber
      });
    }

    // Load user preferences from localStorage
    if (currentUser) {
      const userSaved = localStorage.getItem(`saved_${currentUser.id}`);
      const userWatched = localStorage.getItem(`watched_${currentUser.id}_${animeId}`);

      if (userSaved) {
        const savedData = JSON.parse(userSaved);
        setIsSaved(savedData.includes(animeId));
      }


      if (userWatched) {
        const watchedData = JSON.parse(userWatched);
        setWatchedEpisodes(watchedData);
      }
    }

  }, [animeId, updateWatchHistory, currentUser, episodeNumber, anime, currentVideoUrl]);


  const handleSave = () => {
    if (!currentUser) {
      toast({
        id: String(Date.now()),
        title: "Login Required",
        description: "Please login to save anime"
      });
      return;
    }

    setIsSaved(!isSaved);

    // Save to localStorage
    const userSaved = localStorage.getItem(`saved_${currentUser.id}`);
    const savedData = userSaved ? JSON.parse(userSaved) : [];

    if (isSaved) {
      const index = savedData.indexOf(animeId);
      if (index > -1) savedData.splice(index, 1);
    } else {
      savedData.push(animeId);
    }

    localStorage.setItem(`saved_${currentUser.id}`, JSON.stringify(savedData));

    toast({
      id: String(Date.now()),
      title: isSaved ? "Removed from List" : "Added to List",
      description: `${anime?.title} has been ${isSaved ? 'removed from' : 'added to'} your watchlist`
    });
  };

  const handleEpisodeSelect = useCallback((index: number) => {
    if (!episodes[index]) return;

    const episode = episodes[index];

    // Encode parameters for URL (obfuscated)
    const encodeParams = (epNum: number, epId: number): string => {
      const data = `${epNum}:${epId}`;
      return btoa(data); // base64 encode
    };

    // Update URL - this will trigger the useEffect to update video
    const encodedParam = encodeParams(episode.episodeNumber, episode.id);
    navigate(`/watch/${id}?v=${encodedParam}`, { replace: true });

    // Mark this episode as watched
    const newWatchedEpisodes = Array.from(new Set([...watchedEpisodes, index]));
    setWatchedEpisodes(newWatchedEpisodes);

    // Update localStorage to persist watched episodes
    if (currentUser && animeId) {
      localStorage.setItem(`watched_${currentUser.id}_${animeId}`, JSON.stringify(newWatchedEpisodes));
    }

    toast({
      id: String(Date.now()),
      title: "Episode Changed",
      description: `Now playing: ${episode.title}`,
      duration: 2000,
      action: null
    });
  }, [id, navigate, toast, episodes, watchedEpisodes, currentUser, animeId]);

  const handlePreviousEpisode = () => {
    if (activeEpisode > 0) {
      handleEpisodeSelect(activeEpisode - 1);
    }
  };

  const handleNextEpisode = () => {
    if (activeEpisode < episodes.length - 1) {
      handleEpisodeSelect(activeEpisode + 1);
    }
  };

  const handleShare = async () => {
    const currentEpisode = getCurrentEpisode();
    const shareData = {
      title: `${anime?.title} - Episode ${episodeNumber}`,
      text: `Watch ${anime?.title} Episode ${episodeNumber}: ${currentEpisode?.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        id: String(Date.now()),
        title: "Link Copied",
        description: "Episode link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading anime...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!anime || !id || id === "undefined" || id === "") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-anime-secondary to-anime-accent bg-clip-text text-transparent animate-pulse-slow">404</h1>
            <h2 className="text-2xl font-heading font-bold mb-4">Anime Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The anime or episode you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <a href="/" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Return Home
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Anime
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!animeId) return null;

  const currentEpisode = getCurrentEpisode();
  const episodeTitle = `${anime.title} Episode ${currentEpisode?.episodeNumber || episodeNumber}`;
  const animeImage = getImageUrl(`${anime.bannerImage || anime.coverImage}`);


  return (
    <Layout>
      <SEO
        title={`Watch ${episodeTitle} Online - HD Streaming`}
        description={`Watch ${episodeTitle} in HD quality. ${anime.description?.substring(0, 150) || `Stream ${anime.title} anime online with English subtitles.`}`}
        keywords={`watch ${anime.title}, ${anime.title} episode ${currentEpisode?.episodeNumber || episodeNumber}, ${anime.title} online, stream anime`}
        image={animeImage}
        type="video.movie"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://otakutv.in/" },
          { name: "Anime", url: "https://otakutv.in/anime" },
          { name: anime.title, url: `https://otakutv.in/anime/${anime.id}` },
          { name: `Episode ${currentEpisode?.episodeNumber || episodeNumber}`, url: window.location.href }
        ]}
      />
      <VideoSchema
        name={episodeTitle}
        description={currentEpisode?.title || `Episode ${currentEpisode?.episodeNumber || episodeNumber} of ${anime.title}`}
        thumbnailUrl={getThumbnailUrl()}
        uploadDate={new Date().toISOString()}
        contentUrl={getVideoUrl()}
      />
      <div className="min-h-screen bg-background">
        {/* Main content with container-fluid */}
        <div className="w-full px-2 pb-4">
          <div className={`grid gap-3 ${showPlaylist && showSidebar ? 'grid-cols-1 lg:grid-cols-12' :
            showPlaylist && !showSidebar ? 'grid-cols-1 lg:grid-cols-10' :
              !showPlaylist && showSidebar ? 'grid-cols-1 lg:grid-cols-10' :
                'grid-cols-1'
            }`}>
            {/* Episode List Sidebar - Left (conditionally shown) */}
            {showPlaylist && (
              <div className="lg:col-span-2 order-3 lg:order-1">
                <div className="sticky top-24">
                  <EpisodeList
                    episodes={episodes}
                    active={activeEpisode}
                    onSelectEpisode={handleEpisodeSelect}
                  />
                </div>
              </div>
            )}

            {/* Main Video Section - Center */}
            <div className={`${showPlaylist && showSidebar ? 'lg:col-span-7' :
              showPlaylist && !showSidebar ? 'lg:col-span-8' :
                !showPlaylist && showSidebar ? 'lg:col-span-7' :
                  'lg:col-span-12'
              } order-1 lg:order-2`}>
              <div className="space-y-3">
                {/* Episode title header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-foreground">{anime.title}</h1>
                    <p className="text-sm text-muted-foreground mb-2">
                      Episode {currentEpisode?.episodeNumber || episodeNumber}: {currentEpisode?.title || `Episode ${episodeNumber}`}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {currentEpisode?.views && currentEpisode.views > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {currentEpisode.views.toLocaleString()} views
                        </div>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {anime.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPlaylist(!showPlaylist)}
                      className="gap-2"
                    >
                      <List className="h-4 w-4" />
                      {showPlaylist ? 'Hide' : 'Show'} Playlist
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSidebar(!showSidebar)}
                      className="gap-2"
                    >
                      <Info className="h-4 w-4" />
                      {showSidebar ? 'Hide' : 'Show'} Info
                    </Button>
                  </div>
                </div>

                <VideoPlayer
                  key={`${animeId}-${currentEpisode?.id || activeEpisode}`}
                  videoUrl={getVideoUrl()}
                  thumbnailUrl={getThumbnailUrl()}
                  animeId={animeId}
                  episodeId={currentEpisode?.id?.toString()}
                  onNextEpisode={handleNextEpisode}
                  onPreviousEpisode={handlePreviousEpisode}
                  hasNextEpisode={activeEpisode < episodes.length - 1}
                  hasPreviousEpisode={activeEpisode > 0}
                  episodeTitle={`${anime.title} - Episode ${currentEpisode?.episodeNumber || episodeNumber}: ${currentEpisode?.title || ''}`}
                />

                {/* Interactive Video Controls */}
                <div className="flex items-center justify-between bg-card rounded-lg p-4 border border-border/30">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant={isSaved ? "default" : "outline"}
                      className="gap-2"
                      onClick={handleSave}
                    >
                      <BookmarkPlus className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2" onClick={handleShare}>
                      <Share className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={handlePreviousEpisode}
                      disabled={activeEpisode === 0}
                    >
                      <SkipBack className="h-4 w-4" />
                      Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={handleNextEpisode}
                      disabled={activeEpisode === episodes.length - 1}
                    >
                      <SkipForward className="h-4 w-4" />
                      Next
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                {/* Tmp comment */}
                {/* <div className="mt-8">
                  <CommentsSection comments={[]} />
                </div> */}

                {/* Watch More Seasons Section */}
                {/* <SeasonsSection
                  currentSeasonNumber={anime?.seasonNumber || 1}
                  animeBanner={anime?.bannerImage}
                  animeTitle={anime?.title || ''}
                /> */}
              </div>
            </div>

            {/* Anime Info & Popular - Right */}
            {showSidebar && (
              <div className="lg:col-span-3 order-2 lg:order-3">
                <div className="sticky top-24 space-y-4">
                  <AnimeInfoCard
                    anime={{
                      title: anime.title,
                      description: anime.description || "",
                      rating: Number(anime.rating) || 0,
                      votes: 4167,
                      genres: anime.genres?.map(g => g.name) || [],
                      year: anime.year,
                      studio: anime.studio,
                      duration: anime.episodeDuration,
                      status: anime.status,
                      imageUrl: animeImage
                    }}
                    animeId={animeId}
                  />

                  {/* Popular Anime Section */}
                  <div className="hidden lg:block">
                    <MostPopularSidebar popularAnime={popularAnime} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Popular Anime */}
          <div className="block lg:hidden mt-8">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Popular Anime
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {popularAnime.map((a) => (
                <div key={a.id} className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-border/50">
                  <div className="relative">
                    <img src={a.img} alt={a.title} className="w-full h-32 sm:h-40 object-cover" />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium rounded px-1.5 py-0.5">
                      {a.rating}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm line-clamp-1 mb-1">{a.title}</h4>
                    <div className="text-xs text-muted-foreground mb-2">Episodes: {a.episodes}</div>
                    <Button size="sm" className="w-full h-7 text-xs">
                      <Play className="h-3 w-3 mr-1" /> Watch
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}