
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LazyImage } from "@/components/layout/LazyImage";
import { Heart, Clock, Film, Video } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserProfile() {
  const { currentUser, watchHistory, likedContent, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("history");
  
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
  const hasLikedContent = likedContent.length > 0;

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
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Watch History
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" /> Favorites
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
              <h2 className="text-2xl font-semibold mb-4">Favorites</h2>
              {hasLikedContent ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {likedContent.map((item) => (
                    <Link 
                      to={item.type === "anime" ? `/anime/${item.id}` : `/episodes/${item.id}`} 
                      key={`${item.type}-${item.id}`}
                    >
                      <Card className="overflow-hidden hover:bg-accent/50 transition-colors">
                        <div className="aspect-video relative">
                          <LazyImage 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            {item.type === "anime" ? (
                              <><Film className="h-3 w-3" /> Anime</>
                            ) : (
                              <><Video className="h-3 w-3" /> Episode</>
                            )}
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium line-clamp-1">{item.title}</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/50 rounded-lg">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No Favorites</h3>
                  <p className="text-muted-foreground mt-1">
                    Your favorite anime and episodes will appear here
                  </p>
                  <Link to="/anime">
                    <Button variant="outline" className="mt-4">Browse Anime</Button>
                  </Link>
                </div>
              )}
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
