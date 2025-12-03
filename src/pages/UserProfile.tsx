import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LazyImage } from "@/components/layout/LazyImage";
import { Heart, Clock, Film, Video, Settings, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAudio } from "@/contexts/AudioContext";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { DeleteAccountSection } from "@/components/profile/DeleteAccountSection";
import { likeService, LikedEpisode } from "@/services/likeService";
import { generateWatchUrl } from "@/utils/urlEncoder";
import { BACKEND_API_Image_URL } from "@/utils/constants";

export default function UserProfile() {
  const { currentUser, watchHistory, signOut, refreshUserProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "history";
  const { playButtonClick } = useAudio();
  
  // Liked episodes state
  const [likedEpisodes, setLikedEpisodes] = useState<LikedEpisode[]>([]);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [likedFetched, setLikedFetched] = useState(false);

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Fetch liked episodes only when favorites tab is selected
  useEffect(() => {
    if (activeTab === "favorites" && currentUser && !likedFetched) {
      fetchLikedEpisodes();
    }
  }, [activeTab, currentUser, likedFetched]);

  const fetchLikedEpisodes = async () => {
    setLoadingLiked(true);
    try {
      const response = await likeService.getLikedEpisodes();
      if (response.success) {
        setLikedEpisodes(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch liked episodes:", error);
    } finally {
      setLoadingLiked(false);
      setLikedFetched(true);
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

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* User Header */}
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{currentUser.displayName}'s Profile</h1>
              <p className="text-muted-foreground">{currentUser.email}</p>
              {currentUser.isAdmin && (
                <div className="mt-1">
                  <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded">Admin</span>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl">
              <TabsTrigger value="history" className="flex items-center gap-2" onClick={playButtonClick}>
                <Clock className="h-4 w-4" /> History
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2" onClick={playButtonClick}>
                <Heart className="h-4 w-4" /> Favorites
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
                            src={item.imageUrl}
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

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <h2 className="text-2xl font-semibold mb-4">Liked Episodes</h2>
              {loadingLiked ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : hasLikedContent ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {likedEpisodes.map((item) => (
                    <Link
                      to={generateWatchUrl(String(item.animeId), item.episodeNumber)}
                      key={`episode-${item.episodeId}`}
                    >
                      <Card className="overflow-hidden hover:bg-accent/50 transition-colors">
                        <div className="aspect-video relative">
                          <LazyImage
                            src={item.thumbnail ? `${BACKEND_API_Image_URL}${item.thumbnail}` : item.animeCover ? `${BACKEND_API_Image_URL}${item.animeCover}` : ""}
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
    </Layout >
  );
}
