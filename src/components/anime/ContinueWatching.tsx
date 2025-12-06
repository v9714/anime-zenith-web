import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Clock, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { watchHistoryService, WatchHistoryItem } from "@/services/watchHistoryService";
import { LazyImage } from "@/components/layout/LazyImage";
import { getImageUrl } from "@/utils/commanFunction";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { encodeUrlParam } from "@/utils/urlEncoder";

export function ContinueWatching() {
    const { currentUser } = useAuth();
    const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWatchHistory = async () => {
            if (!currentUser) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await watchHistoryService.getWatchHistory(10, 0);
                if (response.success && response.data) {
                    setWatchHistory(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch watch history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWatchHistory();
    }, [currentUser]);

    const handleRemove = async (animeId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await watchHistoryService.deleteAnimeHistory(animeId);
            setWatchHistory((prev) => prev.filter((item) => item.animeId !== animeId));
            toast({
                id: String(Date.now()),
                title: "Removed from history",
                description: "Item removed from your watch history",
            });
        } catch (error) {
            console.error("Failed to remove from history:", error);
            toast({
                id: String(Date.now()),
                title: "Error",
                description: "Failed to remove from history",
            });
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Don't render if user is not logged in
    if (!currentUser) return null;

    // Loading state
    if (isLoading) {
        return (
            <div className="container py-6">
                <h2 className="text-xl font-heading font-bold mb-4">Continue Watching</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array(5)
                        .fill(0)
                        .map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="aspect-video rounded-lg" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        ))}
                </div>
            </div>
        );
    }

    // Don't render if no watch history
    if (watchHistory.length === 0) return null;

    return (
        <div className="container py-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-heading font-bold">Continue Watching</h2>
                <Link
                    to="/profile"
                    className="text-sm text-primary hover:underline"
                >
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchHistory.map((item) => (
                    <Link
                        key={item.animeId}
                        to={`/anime/${encodeUrlParam(item.animeId)}/watch?ep=${item.episodeNumber}`}
                        className="group relative block rounded-lg overflow-hidden bg-card hover:ring-2 hover:ring-primary/50 transition-all"
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-video">
                            <LazyImage
                                src={getImageUrl(item.episodeThumbnail || item.imageUrl)}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />

                            {/* Play overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                                    <Play className="w-6 h-6 text-primary-foreground fill-current" />
                                </div>
                            </div>

                            {/* Remove button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => handleRemove(item.animeId, e)}
                            >
                                <X className="w-3 h-3" />
                            </Button>

                            {/* Progress bar */}
                            <div className="absolute bottom-0 left-0 right-0">
                                <Progress
                                    value={item.watchedPercentage}
                                    className="h-1 rounded-none bg-muted/50"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-2 space-y-1">
                            <h3 className="text-sm font-medium line-clamp-1">{item.title}</h3>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>EP {item.episodeNumber}</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeAgo(item.lastWatched)}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
