import { useEffect, useMemo, useState } from 'react';
import { Episode, getAnimeEpisodesBySeason } from '@/services/api';
import { EPISODE_SEASONS, EpisodeSeason, BACKEND_API_Image_URL } from '@/utils/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Play, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '@/utils/commanFunction';
import defaultThumbnail from '@/assets/default-episode-thumbnail.jpg';
import { generateWatchUrl } from '@/utils/urlEncoder';
import { watchedEpisodesService } from '@/services/watchedEpisodesService';

interface EpisodesTabProps {
  animeId: number | string;
  defaultSeason?: string;
}

export default function EpisodesTab({ animeId, defaultSeason }: EpisodesTabProps) {
  const normalizedDefault = (defaultSeason || '').toLowerCase();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [watchedEpisodes, setWatchedEpisodes] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getAnimeEpisodesBySeason(animeId)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success) {
          setEpisodes(res.data || []);
        } else {
          setEpisodes([]);
          setError(res?.message || 'Failed to load episodes');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Failed to load episodes');
        setEpisodes([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [animeId]);

  // Fetch watched episodes
  useEffect(() => {
    const fetchWatchedEpisodes = async () => {
      try {
        const response = await watchedEpisodesService.getWatchedEpisodes(Number(animeId));
        if (response.success && response.data?.watchedEpisodes) {
          setWatchedEpisodes(response.data.watchedEpisodes);
        }
      } catch (error) {
        console.error('Error fetching watched episodes:', error);
      }
    };

    fetchWatchedEpisodes();
  }, [animeId]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3 animate-fade-in">
              <Skeleton className="w-full h-40 rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 text-muted-foreground">{error}</div>
      );
    }

    if (!episodes.length) {
      return (
        <div className="text-center py-10 text-muted-foreground">No episodes found for this season.</div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {episodes.map((ep) => {
          const isWatched = watchedEpisodes.includes(ep.episodeNumber);

          return (
            <Card
              key={ep.id}
              className={`p-3 overflow-hidden hover-scale animate-fade-in relative ${isWatched ? 'ring-2 ring-green-500/50 bg-green-500/5' : ''
                }`}
            >
              {/* Watched indicator badge */}
              {isWatched && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-green-500 text-white border-0 shadow-lg">
                    <Check className="h-3 w-3 mr-1" />
                    Watched
                  </Badge>
                </div>
              )}

              <div className="relative aspect-video rounded-md overflow-hidden mb-3 bg-muted">
                <img
                  src={ep.thumbnail ? getImageUrl(ep.thumbnail) : defaultThumbnail}
                  alt={`Episode ${ep.episodeNumber} thumbnail`}
                  className={`w-full h-full object-cover ${isWatched ? 'opacity-80' : ''}`}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = defaultThumbnail;
                  }}
                />
                {!ep.thumbnail && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white/50" />
                  </div>
                )}
                {/* Watched overlay */}
                {isWatched && (
                  <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                    <div className="bg-green-500/90 rounded-full p-2">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={isWatched ? "default" : "secondary"} className={isWatched ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                    Ep {ep.episodeNumber}
                  </Badge>
                  {ep.duration ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {Math.round((ep.duration || 0) / 60)}m
                    </span>
                  ) : null}
                </div>
                <h4 className="font-medium line-clamp-1">{ep.title}</h4>
                {ep.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">{ep.description}</p>
                ) : null}
                <div className="flex gap-2 pt-1">
                  <Button
                    asChild
                    size="sm"
                    className={`rounded-full ${isWatched ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    <Link to={generateWatchUrl(ep.animeId, ep.episodeNumber)}>
                      {isWatched ? (
                        <>
                          <RotateCcw className="h-4 w-4 mr-1" /> Watch Again
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" /> Watch
                        </>
                      )}
                    </Link>
                  </Button>
                  {ep.airDate ? (
                    <Badge variant="outline" className="rounded-full">{new Date(ep.airDate).toLocaleDateString()}</Badge>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }, [loading, error, episodes, watchedEpisodes]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Episodes</h3>
      </div>
      {content}
    </section>
  );
}
