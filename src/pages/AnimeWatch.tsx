import { useState } from "react";
import { Play, Info, Star, Users, MessageSquare } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
}

const anime: AnimeData = {
  title: "The Knight in the Area",
  description:
    "Kakeru and Suguru are brothers who both follow a flaming star for football. But only one, Suguru, becomes a rising star. Kakeru tries to keep up and struggles, but success takes its toll on the relationships closest to him.",
  rating: 8.7,
  votes: 4167
};

const comments = [
  { user: "momie", ago: "25 days ago", content: "to fast re again reely" },
  { user: "Amazing", ago: "3 months ago", content: "BOI THAT shot" },
  { user: "Chopper", ago: "8 months ago", content: "i am stuck relooping scenes for him again" }
];

// Dummy popular anime
const popularAnime = [
  { title: "One Piece", episodes: 1122, img: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", id: 1 },
  { title: "Naruto: Shippuden", episodes: 500, img: "https://cdn.myanimelist.net/images/anime/5/17407.jpg", id: 2 },
  { title: "Bleach", episodes: 366, img: "https://cdn.myanimelist.net/images/anime/3/40451.jpg", id: 3 },
  { title: "Solo Leveling Season 2", episodes: 12, img: "https://cdn.myanimelist.net/images/anime/1734/142860.jpg", id: 4 },
  { title: "Black Clover", episodes: 170, img: "https://cdn.myanimelist.net/images/anime/2/88336.jpg", id: 5 }
];

// --- Components ---

function VideoPlayer() {
  return (
    <div className="relative w-full h-64 md:h-96 bg-black rounded-lg overflow-hidden shadow-lg mb-2 flex items-center justify-center">
      <video
        className="w-full h-full object-cover"
        controls
        poster="https://cdn.myanimelist.net/images/anime/13/56139.jpg"
      >
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
      {/* Dummy overlay: "You are watching..." */}
      <div className="absolute left-3 top-3 bg-primary/90 rounded-md text-xs text-white px-2 py-1 shadow">
        You are watching
      </div>
    </div>
  );
}

function EpisodeList({ episodes, active = 0 }: { episodes: string[]; active?: number }) {
  return (
    <Card className="p-0 bg-card/80 shadow-lg overflow-auto max-h-[380px] min-w-[180px] w-44">
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {episodes.map((ep, i) => (
            <li
              key={i}
              className={`group hover:bg-primary/10 transition-colors flex items-center px-4 py-2 gap-2 cursor-pointer ${
                i === active ? "bg-primary/10 font-semibold text-primary" : ""
              }`}
            >
              <span className="text-xs font-medium w-6 text-muted-foreground">{i + 1}.</span>
              <span className="truncate text-sm">{ep}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Fix the AnimeInfoCard component prop type
function AnimeInfoCard({ anime }: { anime: AnimeData }) {
  return (
    <Card className="bg-card/90 w-full shadow-lg">
      <CardContent className="p-4">
        {/* Thumbnail */}
        <img
          src="https://cdn.myanimelist.net/images/anime/13/56139.jpg"
          alt="Poster"
          className="w-20 h-28 rounded-md float-right ml-2 mb-2 object-cover shadow-md"
        />
        {/* Title and desc */}
        <h2 className="text-lg font-bold mb-1">{anime.title}</h2>
        <div className="text-xs text-muted-foreground mb-2">
          <span>TV</span> <span className="mx-1">•</span>
          <span>24m</span>
        </div>
        <p className="text-sm text-foreground mb-2 line-clamp-4">{anime.description}</p>
        {/* Buttons */}
        <div className="flex flex-wrap gap-2 mb-2">
          <Button size="sm" className="rounded-full flex-1"><Play className="h-4 w-4" /> Watch</Button>
          <Button size="sm" variant="outline" className="rounded-full flex-1"><Info className="h-4 w-4" /> Details</Button>
        </div>
        {/* Voting */}
        <div className="my-2 flex gap-2 items-center">
          <span className="flex items-center gap-1 text-primary font-semibold text-lg">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {anime.rating}
          </span>
          <span className="text-xs text-muted-foreground">Votes: {anime.votes}</span>
          <Button size="sm" variant="secondary" className="ml-auto">Vote now</Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 flex items-center justify-center gap-2 text-muted-foreground border-t pt-2"
        >
          <MessageSquare className="h-4 w-4" />
          Comments
        </Button>
      </CardContent>
    </Card>
  );
}

function CommentsSection() {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <Card className="w-full mt-8 bg-background/70 shadow-lg">
      <CardContent className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="text-primary" />
          <h3 className="font-bold text-xl flex-1">Comments</h3>
          <Button size="sm" variant="secondary" onClick={() => setShowLogin(true)}>
            Login to Comment
          </Button>
        </div>
        {showLogin && (
          <div className="mb-4 text-sm text-accent-foreground bg-accent/40 px-4 py-2 rounded">
            Login feature coming soon!
          </div>
        )}
        <div className="space-y-5 max-h-[280px] overflow-auto pr-1">
          {comments.map((c, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow">
                {c.user[0]}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{c.user}</span>
                  <span className="text-xs text-muted-foreground">{c.ago}</span>
                  {/* Optionally badge */}
                  {c.user === "Amazing" && (
                    <Badge className="bg-yellow-400/90 text-black text-[10px]">Premium</Badge>
                  )}
                </div>
                <div className="text-sm">{c.content}</div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="link" size="sm" className="mt-4 w-full text-muted-foreground">View more</Button>
      </CardContent>
    </Card>
  );
}

function MostPopularSidebar() {
  return (
    <aside className="w-full md:w-[250px] lg:w-[280px] xl:w-[320px] px-0">
      <Card className="bg-card/80 shadow-lg">
        <CardContent className="p-4 pb-0">
          <h3 className="font-bold text-base mb-4">Most Popular</h3>
          <ul className="flex flex-col gap-2">
            {popularAnime.map((a, idx) => (
              <li key={a.id} className="flex gap-2 items-center rounded hover:bg-secondary/20 cursor-pointer transition py-1 px-2">
                <img src={a.img} className="w-11 h-14 rounded shadow object-cover mr-2" alt={a.title} />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium text-sm">{a.title}</div>
                  <div className="text-xs text-muted-foreground">Ep. {a.episodes}</div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </aside>
  );
}

export default function AnimeWatch() {
  return (
    <Layout>
      <div className="container max-w-full px-1 md:px-4 py-5 min-h-screen flex flex-col items-stretch gap-4 animate-fade-in">
        {/* Main view grid: episode list, video, info card, popular sidebar */}
        <div className="flex flex-col lg:flex-row gap-5 w-full">
          {/* Episode List (left) */}
          <div className="order-2 lg:order-1 w-full lg:w-[180px] xl:w-[200px]">
            <EpisodeList episodes={episodes} active={0} />
          </div>
          {/* Video Player (center) */}
          <div className="order-1 lg:order-2 w-full lg:w-[calc(100%-530px)] xl:w-[calc(100%-700px)] flex flex-col">
            <VideoPlayer />
            {/* Controls (mocked) */}
            <div className="flex flex-wrap gap-2 text-xs px-2 md:px-4 py-2 bg-background/80 rounded-b-lg border-t border-border shadow">
              <div className="flex-1 flex gap-2">
                <Button size="sm" variant="ghost" className="rounded-full px-2 text-xs">Expand</Button>
                <Button size="sm" variant="ghost" className="rounded-full px-2 text-xs">Auto Play</Button>
                <Button size="sm" variant="ghost" className="rounded-full px-2 text-xs">Auto Next</Button>
                <Button size="sm" variant="ghost" className="rounded-full px-2 text-xs">HD</Button>
              </div>
              <Button size="sm" variant="secondary" className="rounded-full">
                <Users className="h-3 w-3" />
                WatchTogether
              </Button>
            </div>
          </div>
          {/* Anime Info Card (right) */}
          <div className="order-3 lg:order-3 w-full lg:w-[260px] xl:w-[320px]">
            <AnimeInfoCard anime={anime} />
          </div>
          {/* Popular Sidebar (far right, hidden below xl) */}
          <div className="hidden xl:block order-4 w-[250px]">
            <MostPopularSidebar />
          </div>
        </div>
        {/* Comments below player */}
        <div className="max-w-[900px] w-full mx-auto">
          <CommentsSection />
        </div>
        {/* Show sidebar below on mobile/tablet */}
        <div className="block xl:hidden mt-4">
          <MostPopularSidebar />
        </div>
      </div>
    </Layout>
  );
}
