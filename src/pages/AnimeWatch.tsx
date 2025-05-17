
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// Import new components
import { VideoPlayer } from "@/components/anime/watch/VideoPlayer";
import { VideoControls } from "@/components/anime/watch/VideoControls";
import { EpisodeList } from "@/components/anime/watch/EpisodeList";
import { AnimeInfoCard } from "@/components/anime/watch/AnimeInfoCard";
import { CommentsSection } from "@/components/anime/watch/CommentsSection";
import { MostPopularSidebar } from "@/components/anime/watch/MostPopularSidebar";

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

const comments = [
  { user: "momie", avatar: "M", ago: "25 days ago", content: "to fast re again reely", likes: 12 },
  { user: "Amazing", avatar: "A", ago: "3 months ago", content: "BOI THAT shot", likes: 45, isPremium: true },
  { user: "Chopper", avatar: "C", ago: "8 months ago", content: "i am stuck relooping scenes for him again", likes: 8 },
  { user: "SakuraFan", avatar: "S", ago: "9 months ago", content: "The animation in this episode was top-notch! Can't wait for more!", likes: 23 }
];

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
  const animeId = parseInt(id || "0");
  const { updateWatchHistory } = useAuth();
  const navigate = useNavigate();
  const episodeNumber = 5; // This would be dynamic in a real app
  
  // Record watch history when component mounts
  useEffect(() => {
    if (!animeId) {
      navigate("/");
      return;
    }
    
    updateWatchHistory({
      animeId: animeId,
      title: anime.title,
      imageUrl: "https://cdn.myanimelist.net/images/anime/13/56139.jpg",
      episodeNumber: episodeNumber // Currently hardcoded, should be dynamic in a real app
    });
  }, [animeId, updateWatchHistory, navigate]);
  
  if (!animeId) return null;
  
  return (
    <Layout>
      <div className="container max-w-[1700px] px-2 md:px-4 pt-4 pb-8 animate-fade-in">
        {/* Main view grid: episode list, video, info card, popular sidebar */}
        <div className="flex flex-col lg:flex-row gap-4 xl:gap-6">
          {/* Episode List (left) */}
          <div className="order-2 lg:order-1 w-full lg:w-[220px] xl:w-[240px]">
            <EpisodeList episodes={episodes} active={4} />
          </div>
          
          {/* Video Player and Controls (center) - Wider now */}
          <div className="order-1 lg:order-2 w-full lg:flex-1 flex flex-col">
            <VideoPlayer 
              animeId={animeId} 
              episodeNumber={episodeNumber}
              title={anime.title}
              episodeTitle={`Episode ${episodeNumber}: ${episodes[4]}`}
            />
            <VideoControls />
          </div>
          
          {/* Anime Info Card (right) */}
          <div className="order-3 w-full lg:w-[240px] xl:w-[260px]">
            <AnimeInfoCard anime={anime} animeId={animeId} />
          </div>
          
          {/* Popular Sidebar (far right, hidden below xl) */}
          <div className="hidden xl:block order-4 w-[220px]">
            <MostPopularSidebar popularAnime={popularAnime} />
          </div>
        </div>
        
        {/* Comments below player */}
        <div className="w-full mt-4 xl:mt-6 lg:pr-[220px] xl:pr-0">
          <CommentsSection comments={comments} />
        </div>
        
        {/* Show popular sidebar below on mobile/tablet */}
        <div className="block xl:hidden mt-6">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" /> 
            Popular Anime
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularAnime.map((a) => (
              <div key={a.id} className="bg-card/90 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-border/50">
                <div className="relative">
                  <img src={a.img} alt={a.title} className="w-full h-40 object-cover" />
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium rounded-md px-1.5 py-0.5 shadow">
                    {a.rating}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm line-clamp-1 mb-1">{a.title}</h4>
                  <div className="text-xs text-muted-foreground">Episodes: {a.episodes}</div>
                  <Button size="sm" className="w-full mt-2 bg-primary/90 hover:bg-primary">
                    <Play className="h-3 w-3 mr-1" /> Watch
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
