import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LazyImage } from "@/components/layout/LazyImage";
import { Heart, Clock, Film, Video, Settings, Loader2, Bookmark, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAudio } from "@/contexts/AudioContext";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { DeleteAccountSection } from "@/components/profile/DeleteAccountSection";
import { likeService, LikedEpisode, watchlistService, WatchlistAnime } from "@/services/likeService";
import { watchedEpisodesService, GroupedWatchedAnime } from "@/services/watchedEpisodesService";
import { generateWatchUrl } from "@/utils/urlEncoder";
import { getImageUrl } from "@/utils/commanFunction";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const LIKES_PER_PAGE = 20;
const WATCHLIST_PER_PAGE = 50;
const WATCHED_PER_PAGE = 50;

export default function UserProfile() {
  const { currentUser, watchHistory, signOut, refreshUserProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "history";
  const { playButtonClick } = useAudio();

  // Liked episodes state
  const [likedEpisodes, setLikedEpisodes] = useState<LikedEpisode[]>([]);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [likedFetched, setLikedFetched] = useState(false);
  const [likedPage, setLikedPage] = useState(0);
  const [hasMoreLiked, setHasMoreLiked] = useState(true);

  // Watchlist state
  const [watchlistAnime, setWatchlistAnime] = useState<WatchlistAnime[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [watchlistFetched, setWatchlistFetched] = useState(false);
  const [watchlistPage, setWatchlistPage] = useState(0);
  const [hasMoreWatchlist, setHasMoreWatchlist] = useState(true);

  // Watched episodes state
  const [watchedAnimes, setWatchedAnimes] = useState<GroupedWatchedAnime[]>([]);
  const [loadingWatched, setLoadingWatched] = useState(false);
  const [watchedFetched, setWatchedFetched] = useState(false);
  const [watchedPage, setWatchedPage] = useState(0);
  const [hasMoreWatched, setHasMoreWatched] = useState(true);

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Fetch liked episodes only when likes tab is selected
  useEffect(() => {
    if (activeTab === "likes" && currentUser && !likedFetched) {
      fetchLikedEpisodes(0);
    }
  }, [activeTab, currentUser, likedFetched]);

  // Fetch watchlist only when watchlist tab is selected
  useEffect(() => {
    if (activeTab === "watchlist" && currentUser && !watchlistFetched) {
      fetchWatchlist(0);
    }
  }, [activeTab, currentUser, watchlistFetched]);

  // Fetch watched animes only when watched tab is selected
  useEffect(() => {
    if (activeTab === "watched" && currentUser && !watchedFetched) {
      fetchWatchedAnimes(0);
    }
  }, [activeTab, currentUser, watchedFetched]);

  const fetchLikedEpisodes = async (page: number) => {
    setLoadingLiked(true);
    try {
      const response = await likeService.getLikedEpisodes(LIKES_PER_PAGE, page * LIKES_PER_PAGE);
      if (response.success) {
        if (page === 0) {
          setLikedEpisodes(response.data);
        } else {
          setLikedEpisodes(prev => [...prev, ...response.data]);
        }
        setHasMoreLiked(response.data.length === LIKES_PER_PAGE);
        setLikedPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch liked episodes:", error);
    } finally {
      setLoadingLiked(false);
      setLikedFetched(true);
    }
  };

  const fetchWatchlist = async (page: number) => {
    setLoadingWatchlist(true);
    try {
      const response = await watchlistService.getWatchlist(WATCHLIST_PER_PAGE, page * WATCHLIST_PER_PAGE);
      if (response.success) {
        if (page === 0) {
          setWatchlistAnime(response.data);
        } else {
          setWatchlistAnime(prev => [...prev, ...response.data]);
        }
        setHasMoreWatchlist(response.data.length === WATCHLIST_PER_PAGE);
        setWatchlistPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    } finally {
      setLoadingWatchlist(false);
      setWatchlistFetched(true);
    }
  };

  const fetchWatchedAnimes = async (page: number) => {
    setLoadingWatched(true);
    try {
      const groupedAnimes = await watchedEpisodesService.getGroupedWatchedAnimes(WATCHED_PER_PAGE, page * WATCHED_PER_PAGE);
      if (page === 0) {
        setWatchedAnimes(groupedAnimes);
      } else {
        setWatchedAnimes(prev => [...prev, ...groupedAnimes]);
      }
      setHasMoreWatched(groupedAnimes.length === WATCHED_PER_PAGE);
      setWatchedPage(page);
    } catch (error) {
      console.error("Failed to fetch watched animes:", error);
    } finally {
      setLoadingWatched(false);
      setWatchedFetched(true);
    }
  };

  const handleRemoveFromWatchlist = async (animeId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await watchlistService.removeFromWatchlist(animeId);
      setWatchlistAnime(prev => prev.filter(item => item.animeId !== animeId));
      toast({
        id: String(Date.now()),
        title: "Removed from watchlist",
        description: "Anime has been removed from your watchlist"
      });
    } catch (error) {
      toast({
        id: String(Date.now()),
        title: "Error",
        description: "Failed to remove from watchlist"
      });
    }
  };

  const handleProfileUpdate = async () => {
    await refreshUserProfile();
  };

  const handleAccountDelete = () => {
    signOut();
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">User Profile</h1>
          <p>You need to be logged in to view this page.</p>
        </div>
      </Layout>
    );
  }

  const hasWatchHistory = watchHistory.length > 0;
  const hasLikedContent = likedEpisodes.length > 0;
  const hasWatchlistContent = watchlistAnime.length > 0;
  const hasWatchedContent = watchedAnimes.length > 0;

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* User Header */}
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={getImageUrl(currentUser.avatarUrl || undefined)} alt={currentUser.displayName} />
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{currentUser.displayName}'s Profile</h1>
                <p className="text-muted-foreground">{currentUser.email}</p>
                {currentUser.isAdmin && (
                  <div className="mt-1">
                    <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded">Admin</span>
                  </div>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl">
              <TabsTrigger value="history" className="flex items-center gap-2" onClick={playButtonClick}>
                <Clock className="h-4 w-4" /> History
              </TabsTrigger>
              <TabsTrigger value="watched" className="flex items-center gap-2" onClick={playButtonClick}>
                <Eye className="h-4 w-4" /> Watched
              </TabsTrigger>
              <TabsTrigger value="likes" className="flex items-center gap-2" onClick={playButtonClick}>
                <Heart className="h-4 w-4" /> Likes
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="flex items-center gap-2" onClick={playButtonClick}>
                <Bookmark className="h-4 w-4" /> Watchlist
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2" onClick={playButtonClick}>
                <Settings className="h-4 w-4" /> Settings
              </TabsTrigger>
            </TabsList>

            {/* Watch History Tab */}
            <TabsContent value="history">
              <h2 className="text-2xl font-semibold mb-4">Watch History</h2>
              {hasWatchHistory ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {watchHistory.map((item) => (
                    <Link to={`/anime/${item.animeId}`} key={`${item.animeId}-${item.lastWatched}`}>
                      <Card className="overflow-hidden hover:bg-accent/50 transition-colors">
                        <div className="aspect-video relative">
                          <LazyImage
                            src={getImageUrl(item.imageUrl)}
                            alt={item.title}
                            className="object-cover"
                          />
                          {item.episodeNumber && (
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              Episode {item.episodeNumber}
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium line-clamp-1">{item.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Watched: {new Date(item.lastWatched).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/50 rounded-lg">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No Watch History</h3>
                  <p className="text-muted-foreground mt-1">
                    Your watch history will appear here
                  </p>
                  <Link to="/anime">
                    <Button variant="outline" className="mt-4">Browse Anime</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* Watched Tab */}
            <TabsContent value="watched">
              <h2 className="text-2xl font-semibold mb-4">Watched Animes</h2>
              {loadingWatched && watchedAnimes.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : hasWatchedContent ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {watchedAnimes.map((item, index) => (
                      <Link
                        to={`/anime/${item.animeId}`}
                        key={`watched-${item.animeId}-${index}`}
                      >
                        <Card className="overflow-hidden hover:bg-accent/50 transition-colors group">
                          <div className="aspect-[2/3] relative">
                            <LazyImage
                              src={getImageUrl(item.coverImage)}
                              alt={item.title}
                              className="object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <div className="flex items-center gap-1 text-white text-xs">
                                <Eye className="h-3 w-3" />
                                <span>{item.watchedEpisodesCount} Episodes Watched</span>
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last watched: {new Date(item.lastWatchedAt).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  {/* Pagination */}
                  {hasMoreWatched && (
                    <div className="flex justify-center mt-6">
                      <Button
                        variant="outline"
                        onClick={() => fetchWatchedAnimes(watchedPage + 1)}
                        disabled={loadingWatched}
                      >
                        {loadingWatched ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-muted/50 rounded-lg">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No Watched Animes</h3>
                  <p className="text-muted-foreground mt-1">
                    Animes you watch will appear here with progress
                  </p>
                  <Link to="/anime">
                    <Button variant="outline" className="mt-4">Browse Anime</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* Likes Tab */}
            <TabsContent value="likes">
              <h2 className="text-2xl font-semibold mb-4">Liked Episodes</h2>
              {loadingLiked && likedEpisodes.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : hasLikedContent ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {likedEpisodes.map((item) => (
                      <Link
                        to={generateWatchUrl(String(item.animeId), item.episodeNumber)}
                        key={`episode-${item.episodeId}`}
                      >
                        <Card className="overflow-hidden hover:bg-accent/50 transition-colors">
                          <div className="aspect-video relative">
                            <LazyImage
                              src={getImageUrl(item.thumbnail) || getImageUrl(item.animeCover)}
                              alt={item.episodeTitle}
                              className="object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                              <Video className="h-3 w-3" /> Ep {item.episodeNumber}
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium line-clamp-1">{item.animeTitle}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {item.episodeTitle}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Liked: {new Date(item.likedAt).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  {/* Pagination */}
                  {hasMoreLiked && (
                    <div className="flex justify-center mt-6">
                      <Button
                        variant="outline"
                        onClick={() => fetchLikedEpisodes(likedPage + 1)}
                        disabled={loadingLiked}
                      >
                        {loadingLiked ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-muted/50 rounded-lg">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No Liked Episodes</h3>
                  <p className="text-muted-foreground mt-1">
                    Episodes you like will appear here
                  </p>
                  <Link to="/anime">
                    <Button variant="outline" className="mt-4">Browse Anime</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* Watchlist Tab */}
            <TabsContent value="watchlist">
              <h2 className="text-2xl font-semibold mb-4">My Watchlist</h2>
              {loadingWatchlist && watchlistAnime.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : hasWatchlistContent ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {watchlistAnime.map((item) => (
                      <Link
                        to={`/anime/${item.animeId}`}
                        key={`watchlist-${item.animeId}`}
                      >
                        <Card className="overflow-hidden hover:bg-accent/50 transition-colors group">
                          <div className="aspect-[2/3] relative">
                            <LazyImage
                              src={getImageUrl(item.coverImage)}
                              alt={item.title}
                              className="object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {item.status}
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleRemoveFromWatchlist(item.animeId, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium line-clamp-1">{item.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{item.year}</span>
                              <span>•</span>
                              <span>
                                ⭐ {
                                  typeof item.rating === "number"
                                    ? item.rating.toFixed(1)
                                    : "N/A"
                                }
                              </span>

                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Added: {new Date(item.addedAt).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  {/* Pagination */}
                  {hasMoreWatchlist && (
                    <div className="flex justify-center mt-6">
                      <Button
                        variant="outline"
                        onClick={() => fetchWatchlist(watchlistPage + 1)}
                        disabled={loadingWatchlist}
                      >
                        {loadingWatchlist ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-muted/50 rounded-lg">
                  <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">Empty Watchlist</h3>
                  <p className="text-muted-foreground mt-1">
                    Anime you save will appear here
                  </p>
                  <Link to="/anime">
                    <Button variant="outline" className="mt-4">Browse Anime</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
              <div className="space-y-6">
                {currentUser && (
                  <>
                    <ProfileEditForm currentUser={currentUser} onUpdate={handleProfileUpdate} />
                    <DeleteAccountSection currentUser={currentUser} onDelete={handleAccountDelete} />
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Admin Panel Link */}
          {currentUser.isAdmin && (
            <div className="mt-8 p-4 border border-primary/30 bg-primary/10 rounded-lg">
              <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                <span className="bg-primary text-white text-xs font-medium px-2 py-1 rounded">Admin</span>
                Admin Dashboard
              </h3>
              <p className="mb-3">You have admin privileges. Access the admin dashboard to manage content.</p>
              <Link to="/admin">
                <Button>Go to Admin Dashboard</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
