
import { useState } from "react";
import { Play, Info, Star, Users, MessageSquare, Heart, Plus, Share, ThumbsUp, ThumbsDown, Volume, List } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

// --- Components ---

function VideoPlayer() {
  const [showControls, setShowControls] = useState(false);
  
  return (
    <div 
      className="relative w-full h-64 md:h-[450px] bg-black rounded-lg overflow-hidden shadow-xl mb-4 group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        className="w-full h-full object-cover"
        controls={false}
        poster="https://cdn.myanimelist.net/images/anime/13/56139.jpg"
      >
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
      
      {/* Custom video player overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4`}>
        {/* Top controls */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-black/70 text-white border-none">
            Episode 5: Ryuuma goes!
          </Badge>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white">
              <Volume className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Center play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button size="lg" className="h-16 w-16 rounded-full bg-primary/90 hover:bg-primary/100 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <Play className="h-7 w-7 fill-current" />
          </Button>
        </div>
        
        {/* Progress bar and controls */}
        <div className="w-full space-y-2">
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full w-[35%] bg-primary rounded-full"></div>
          </div>
          
          {/* Bottom controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 px-2 h-8">
                <Play className="h-4 w-4 mr-1" /> 
                Play
              </Button>
              <div className="text-xs text-white/70">05:23 / 23:45</div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 h-8 w-8 p-0">
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 h-8 w-8 p-0">
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 h-8 w-8 p-0">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* "Now Playing" badge */}
      <div className="absolute left-3 top-3 bg-primary/90 rounded-md text-xs text-white px-2 py-1 shadow-[0_0_10px_rgba(138,43,226,0.5)]">
        Now Playing
      </div>
      
      {/* Subtitle example */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="inline-block bg-black/50 text-white px-4 py-1 rounded text-sm mx-auto shadow-md">
          I have to keep trying, no matter what!
        </div>
      </div>
    </div>
  );
}

function EpisodeList({ episodes, active = 0 }: { episodes: string[]; active?: number }) {
  return (
    <Card className="bg-card/90 shadow-xl overflow-hidden border-border/50 h-[450px]">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Episodes</h3>
          <Badge variant="outline" className="text-xs">Season 1</Badge>
        </div>
        
        <ScrollArea className="h-[400px] pr-2">
          <ul className="space-y-1">
            {episodes.map((ep, i) => (
              <li
                key={i}
                className={`group hover:bg-primary/15 transition-colors rounded-md flex items-center p-2 gap-2 cursor-pointer ${
                  i === active ? "bg-primary/20 text-primary" : ""
                }`}
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                  i === active ? "bg-primary text-white" : "bg-accent/20 text-foreground group-hover:bg-primary/30"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{ep}</p>
                  <p className="text-xs text-muted-foreground">24:15</p>
                </div>
                <Play className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                  i === active ? "text-primary" : "text-muted-foreground"
                }`} />
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AnimeInfoCard({ anime }: { anime: AnimeData }) {
  return (
    <Card className="bg-card/90 w-full shadow-xl border-border/50">
      <CardContent className="p-4">
        <div className="relative mb-4">
          <img
            src="https://cdn.myanimelist.net/images/anime/13/56139.jpg"
            alt={anime.title}
            className="w-full h-40 rounded-md object-cover shadow-md"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-md"></div>
          <div className="absolute bottom-0 p-3">
            <h2 className="text-lg font-bold text-white">{anime.title}</h2>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <span>{anime.year}</span>
              <span className="w-1 h-1 rounded-full bg-white/80"></span>
              <span>{anime.studio}</span>
              <span className="w-1 h-1 rounded-full bg-white/80"></span>
              <span>{anime.duration}</span>
            </div>
          </div>
        </div>
        
        {/* Ratings */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center bg-primary/10 rounded-lg p-2 text-primary">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            <span className="ml-1 text-lg font-bold">{anime.rating}</span>
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">User Rating</div>
            <div className="h-2 bg-muted rounded-full">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${(anime.rating/10)*100}%` }}></div>
            </div>
          </div>
        </div>
        
        {/* Genre tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {anime.genres?.map((genre, idx) => (
            <Badge key={idx} variant="secondary" className="bg-secondary/20 text-secondary-foreground">{genre}</Badge>
          ))}
        </div>
        
        {/* Description */}
        <p className="text-sm text-foreground mb-4 line-clamp-3">{anime.description}</p>
        
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            <Play className="h-4 w-4 mr-1" /> Watch Now
          </Button>
          <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
            <Plus className="h-4 w-4 mr-1" /> Add to List
          </Button>
        </div>
        
        {/* Extra options */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Heart className="h-4 w-4 mr-1" /> Favorite
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Share className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CommentsSection() {
  const [showLogin, setShowLogin] = useState(false);
  
  return (
    <Card className="w-full mt-6 bg-card/90 shadow-xl border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="text-primary h-5 w-5" />
          <h3 className="font-bold text-lg flex-1">Comments</h3>
          <Button size="sm" variant="secondary" onClick={() => setShowLogin(true)} className="bg-secondary/90 hover:bg-secondary text-white">
            Login to Comment
          </Button>
        </div>
        
        {showLogin && (
          <div className="mb-4 text-sm bg-accent/30 border border-accent/20 px-4 py-3 rounded-md">
            <p className="text-accent-foreground">Login to join the conversation! Share your thoughts with other anime fans.</p>
          </div>
        )}
        
        <div className="space-y-4 max-h-[320px] overflow-auto pr-1">
          {comments.map((c, idx) => (
            <div key={idx} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-md">
                {c.avatar}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{c.user}</span>
                  <span className="text-xs text-muted-foreground">{c.ago}</span>
                  {c.isPremium && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px]">Premium</Badge>
                  )}
                </div>
                <div className="text-sm mb-2">{c.content}</div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="h-3 w-3" /> {c.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
                    <MessageSquare className="h-3 w-3" /> Reply
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button variant="ghost" size="sm" className="mt-3 w-full text-muted-foreground hover:text-foreground">
          View more comments
        </Button>
      </CardContent>
    </Card>
  );
}

function MostPopularSidebar() {
  return (
    <Card className="bg-card/90 shadow-xl border-border/50">
      <CardContent className="p-4">
        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" /> 
          Top Anime
        </h3>
        
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-3">
            {popularAnime.map((a, idx) => (
              <div 
                key={a.id} 
                className="flex hover:bg-primary/10 transition-colors rounded-lg p-2 cursor-pointer"
              >
                <div className="relative mr-3">
                  <img 
                    src={a.img} 
                    className="w-16 h-24 rounded-md object-cover shadow-md" 
                    alt={a.title} 
                  />
                  <div className="absolute top-1 right-1 bg-black/60 text-white text-xs font-medium rounded-md px-1.5 py-0.5 shadow">
                    {a.rating}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">{a.title}</h4>
                  <div className="text-xs text-muted-foreground mb-1.5">Episodes: {a.episodes}</div>
                  <div className="flex items-center">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs bg-primary/20 text-primary hover:bg-primary/30 rounded-full">
                      <Play className="h-3 w-3 mr-1" /> Watch
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function VideoControls() {
  return (
    <Card className="bg-card/90 shadow-lg border-border/50 mb-6">
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1 h-8">
                  <Volume className="h-4 w-4" /> Audio & Subtitles
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" className="w-56 p-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Audio</div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" variant="ghost" className="justify-start h-7 text-xs bg-primary/10 text-primary">Japanese</Button>
                    <Button size="sm" variant="ghost" className="justify-start h-7 text-xs">English</Button>
                  </div>
                  <div className="text-sm font-medium mt-2">Subtitles</div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" variant="ghost" className="justify-start h-7 text-xs bg-secondary/10 text-secondary">English</Button>
                    <Button size="sm" variant="ghost" className="justify-start h-7 text-xs">Spanish</Button>
                    <Button size="sm" variant="ghost" className="justify-start h-7 text-xs">Off</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button size="sm" variant="outline" className="gap-1 h-8">
              <List className="h-4 w-4" /> Playlist
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="default" className="gap-1 h-8 rounded-full bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary">
              <Users className="h-4 w-4" /> Watch Together
            </Button>
            
            <Button size="sm" variant="outline" className="gap-1 h-8 rounded-full">
              <Heart className="h-4 w-4" /> Favorite
            </Button>
            
            <Button size="sm" variant="outline" className="gap-1 h-8 rounded-full">
              <Share className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnimeWatch() {
  return (
    <Layout>
      <div className="container max-w-[1600px] px-2 md:px-4 pt-4 pb-8 animate-fade-in">
        {/* Main view grid: episode list, video, info card, popular sidebar */}
        <div className="flex flex-col lg:flex-row gap-4 xl:gap-6">
          {/* Episode List (left) */}
          <div className="order-2 lg:order-1 w-full lg:w-[240px] xl:w-[280px]">
            <EpisodeList episodes={episodes} active={4} />
          </div>
          
          {/* Video Player and Controls (center) */}
          <div className="order-1 lg:order-2 w-full lg:flex-1 flex flex-col">
            <VideoPlayer />
            <VideoControls />
          </div>
          
          {/* Anime Info Card (right) */}
          <div className="order-3 w-full lg:w-[260px] xl:w-[300px]">
            <AnimeInfoCard anime={anime} />
          </div>
          
          {/* Popular Sidebar (far right, hidden below xl) */}
          <div className="hidden xl:block order-4 w-[240px]">
            <MostPopularSidebar />
          </div>
        </div>
        
        {/* Comments below player */}
        <div className="w-full mt-4 xl:mt-6 lg:pr-[240px] xl:pr-0">
          <CommentsSection />
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
