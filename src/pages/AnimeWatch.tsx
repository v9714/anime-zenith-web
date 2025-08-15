
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Star, Play, Heart, Share, SkipBack, SkipForward, List, Info, ThumbsUp, BookmarkPlus, MessageCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Import components
import { EpisodeList } from "@/components/anime/watch/EpisodeList";
import { AnimeInfoCard } from "@/components/anime/watch/AnimeInfoCard";
import { CommentsSection } from "@/components/anime/watch/CommentsSection";
import { MostPopularSidebar } from "@/components/anime/watch/MostPopularSidebar";
import { LikeButton } from "@/components/anime/watch/LikeButton";
import { SaveButton } from "@/components/anime/watch/SaveButton";
import VideoPlayer from "@/components/anime/watch/VideoPlayer";

// Dummy data
const episodes = [
  "Emperor, focus and drive",
  "Desperate situation",
  "Penalty win to victory",
  "Fierce battle! Resolve",
  "Ryuuma goes!",
  "The summitt battle koma...",
  "Partly cloudy",
  "5th representative trainin...",
  "World match decision",
  "Whole home, rematch...",
  "The challenge",
  "Raise the curtain! High sc...",
  "New total football",
  "Storm warning"
];

// Define the anime type correctly
interface AnimeData {
  title: string;
  description: string;
  rating: number;
  votes: number;
  genres?: string[];
  year?: number;
  studio?: string;
  duration?: string;
  status?: string;
}

const anime: AnimeData = {
  title: "The Knight in the Area",
  description: "Kakeru and Suguru are brothers who both follow a flaming star for football. But only one, Suguru, becomes a rising star. Kakeru tries to keep up and struggles, but success takes its toll on the relationships closest to him.",
  rating: 8.7,
  votes: 4167,
  genres: ["Sports", "Drama", "Slice of Life"],
  year: 2012,
  studio: "Shin-Ei Animation",
  duration: "24 min per ep",
  status: "Completed"
};

// Episode-specific comments data
const episodeComments = {
  0: [
    { user: "AnimeExplorer", avatar: "A", ago: "2 hours ago", content: "What an incredible start to the series! The animation quality is outstanding.", likes: 45, isPremium: true },
    { user: "MangaReader", avatar: "M", ago: "5 hours ago", content: "They adapted this episode perfectly from the manga. So faithful!", likes: 23 },
    { user: "FirstTimer", avatar: "F", ago: "1 day ago", content: "Never watched this series before, but this episode got me hooked!", likes: 67 }
  ],
  1: [
    { user: "ActionFan", avatar: "A", ago: "3 hours ago", content: "The desperate situation was portrayed so well. My heart was racing!", likes: 78 },
    { user: "EmotionalViewer", avatar: "E", ago: "6 hours ago", content: "This episode hit me right in the feels. Such great character development.", likes: 34 }
  ],
  2: [
    { user: "SportsAnime", avatar: "S", ago: "1 hour ago", content: "Best penalty scene I've ever seen in anime! The tension was incredible.", likes: 92 },
    { user: "TacticsGuru", avatar: "T", ago: "4 hours ago", content: "The strategy behind this win was brilliant. Love how they explained it.", likes: 56 }
  ],
  3: [
    { user: "BattleFan", avatar: "B", ago: "30 minutes ago", content: "Fierce battle indeed! The resolve shown by the characters was amazing.", likes: 43 },
    { user: "CharacterLover", avatar: "C", ago: "2 hours ago", content: "The character growth in this episode was phenomenal!", likes: 29 }
  ],
  4: [
    { user: "momie", avatar: "M", ago: "25 days ago", content: "to fast re again reely", likes: 12 },
    { user: "Amazing", avatar: "A", ago: "3 months ago", content: "BOI THAT shot", likes: 45, isPremium: true },
    { user: "Chopper", avatar: "C", ago: "8 months ago", content: "i am stuck relooping scenes for him again", likes: 8 },
    { user: "SakuraFan", avatar: "S", ago: "9 months ago", content: "The animation in this episode was top-notch! Can't wait for more!", likes: 23 }
  ]
};

// Get comments for current episode or default to episode 5 comments
const getCurrentComments = (episodeIndex: number) => {
  return episodeComments[episodeIndex as keyof typeof episodeComments] || episodeComments[4];
};

// Dummy popular anime
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
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get dynamic values from URL query parameters
  const videoUrl = searchParams.get('videoUrl') || "";
  const thumbnailUrl = searchParams.get('thumbnailUrl') || "";
  const episodeNumber = parseInt(searchParams.get('episode') || "1");
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(1247);
  const [views, setViews] = useState(125634);
  const [activeEpisode, setActiveEpisode] = useState(episodeNumber - 1);

  // Record watch history and load user preferences when component mounts
  useEffect(() => {
    if (!animeId || !videoUrl) {
      navigate("/");
      return;
    }

    updateWatchHistory({
      animeId: animeId,
      title: anime.title,
      imageUrl: "https://cdn.myanimelist.net/images/anime/13/56139.jpg",
      episodeNumber: episodeNumber
    });

    // Load user preferences from localStorage or API
    if (currentUser) {
      const userLikes = localStorage.getItem(`likes_${currentUser.id}`);
      const userSaved = localStorage.getItem(`saved_${currentUser.id}`);
      if (userLikes) {
        const likesData = JSON.parse(userLikes);
        setIsLiked(likesData.includes(`${animeId}_${episodeNumber}`));
      }
      if (userSaved) {
        const savedData = JSON.parse(userSaved);
        setIsSaved(savedData.includes(animeId));
      }
    }

    // Increment view count
    setViews(prev => prev + 1);
    
    // Update active episode when URL changes
    setActiveEpisode(episodeNumber - 1);
  }, [animeId, updateWatchHistory, navigate, currentUser, episodeNumber]);

  const handleLike = () => {
    if (!currentUser) {
      toast({
        id: String(Date.now()),
        title: "Login Required",
        description: "Please login to like episodes"
      });
      return;
    }

    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    // Save to localStorage
    const userLikes = localStorage.getItem(`likes_${currentUser.id}`);
    const likesData = userLikes ? JSON.parse(userLikes) : [];
    const episodeKey = `${animeId}_${episodeNumber}`;
    
    if (isLiked) {
      const index = likesData.indexOf(episodeKey);
      if (index > -1) likesData.splice(index, 1);
    } else {
      likesData.push(episodeKey);
    }
    
    localStorage.setItem(`likes_${currentUser.id}`, JSON.stringify(likesData));
    
    toast({
      id: String(Date.now()),
      title: isLiked ? "Removed Like" : "Liked Episode",
      description: `Episode ${episodeNumber} has been ${isLiked ? 'unliked' : 'liked'}`
    });
  };

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
      description: `${anime.title} has been ${isSaved ? 'removed from' : 'added to'} your watchlist`
    });
  };

  const handleEpisodeSelect = (episodeIndex: number) => {
    setActiveEpisode(episodeIndex);
    const newEpisodeNumber = episodeIndex + 1;
    
    // Update URL with new episode parameters - you would get these from your API
    const newVideoUrl = `http://localhost:8081/uploads/demon_slayer/season_1/episode_${newEpisodeNumber}/master.m3u8`;
    const newThumbnailUrl = `http://localhost:8081/uploads/demon_slayer/episode_${newEpisodeNumber}_thumb.jpg`;
    
    // Navigate to new episode URL
    navigate(`/anime/${animeId}/watch?episode=${newEpisodeNumber}&videoUrl=${encodeURIComponent(newVideoUrl)}&thumbnailUrl=${encodeURIComponent(newThumbnailUrl)}`);
    
    toast({
      id: String(Date.now()),
      title: "Episode Changed",
      description: `Now playing Episode ${newEpisodeNumber}: ${episodes[episodeIndex]}`
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: `${anime.title} - Episode ${episodeNumber}`,
      text: `Watch ${anime.title} Episode ${episodeNumber}: ${episodes[episodeNumber - 1]}`,
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

  if (!animeId) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Main content with container-fluid */}
        <div className="w-full px-4 pb-8">
          <div className={`grid gap-6 ${showPlaylist && showSidebar ? 'grid-cols-1 lg:grid-cols-12' :
            showPlaylist && !showSidebar ? 'grid-cols-1 lg:grid-cols-9' :
              !showPlaylist && showSidebar ? 'grid-cols-1 lg:grid-cols-9' :
                'grid-cols-1'
            }`}>
            {/* Episode List Sidebar - Left (conditionally shown) */}
            {showPlaylist && (
              <div className="lg:col-span-3 order-3 lg:order-1">
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
            <div className={`${showPlaylist && showSidebar ? 'lg:col-span-6' :
              showPlaylist && !showSidebar ? 'lg:col-span-6' :
                !showPlaylist && showSidebar ? 'lg:col-span-6' :
                  'lg:col-span-12'
              } order-1 lg:order-2`}>
              <div className="space-y-4">
                {/* Episode title header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-foreground">{anime.title}</h1>
                    <p className="text-sm text-muted-foreground mb-2">
                      Episode {episodeNumber}: {episodes[activeEpisode] || episodes[episodeNumber - 1]}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {likes.toLocaleString()} likes
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        {views.toLocaleString()} views
                      </div>
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
                  videoUrl={videoUrl}
                  thumbnailUrl={thumbnailUrl}
                />

                {/* Interactive Video Controls */}
                <div className="flex items-center justify-between bg-card rounded-lg p-4 border border-border/30">
                  <div className="flex items-center gap-3">
                    <Button 
                      size="sm" 
                      variant={isLiked ? "default" : "outline"} 
                      className="gap-2"
                      onClick={handleLike}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'} ({likes})
                    </Button>
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
                    <Button size="sm" variant="ghost" className="gap-2">
                      <SkipBack className="h-4 w-4" />
                      Prev
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-2">
                      <SkipForward className="h-4 w-4" />
                      Next
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mt-8">
                  <CommentsSection comments={getCurrentComments(activeEpisode)} />
                </div>
              </div>
            </div>

            {/* Anime Info & Popular - Right */}
            {showSidebar && (
              <div className="lg:col-span-3 order-2 lg:order-3">
                <div className="sticky top-24 space-y-6">
                  <AnimeInfoCard anime={anime} animeId={animeId} />

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
