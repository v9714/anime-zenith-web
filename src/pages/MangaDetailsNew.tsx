import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Star, 
  User, 
  Palette, 
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Share2,
  Heart,
  BookMarked
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMangaDetails, useMangaChapters } from '@/hooks/useMangaDex';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function MangaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [chapterOrder, setChapterOrder] = useState<'asc' | 'desc'>('desc');

  const { data: manga, isLoading: loadingManga } = useMangaDetails(id || '');
  const { data: chaptersData, isLoading: loadingChapters } = useMangaChapters(id || '', 'en');

  const chapters = chaptersData?.pages.flatMap(page => page.data) || [];
  const totalChapters = chaptersData?.pages[0]?.total || 0;

  const sortedChapters = [...chapters].sort((a, b) => {
    const aNum = parseFloat(a.chapter || '0');
    const bNum = parseFloat(b.chapter || '0');
    return chapterOrder === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const statusColors: Record<string, string> = {
    ongoing: 'bg-green-500/20 text-green-400 border-green-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    hiatus: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const handleStartReading = () => {
    if (sortedChapters.length > 0) {
      const firstChapter = chapterOrder === 'asc' 
        ? sortedChapters[0] 
        : sortedChapters[sortedChapters.length - 1];
      navigate(`/read/${id}/chapter/${firstChapter.id}`);
    }
  };

  if (loadingManga) {
    return (
      <Layout>
        <DetailsSkeleton />
      </Layout>
    );
  }

  if (!manga) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Manga Not Found</h1>
          <Button asChild>
            <Link to="/browse">Browse Manga</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title={`${manga.title} - MangaVerse`}
        description={manga.description.slice(0, 160)}
      />

      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-64 relative z-10 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cover & Actions */}
          <div className="flex-shrink-0 space-y-4">
            <div className="relative w-64 mx-auto lg:mx-0">
              <img
                src={manga.coverUrl}
                alt={manga.title}
                className="w-full aspect-[2/3] object-cover rounded-xl shadow-2xl"
              />
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 w-64 mx-auto lg:mx-0">
              <Button 
                onClick={handleStartReading}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
                size="lg"
                disabled={chapters.length === 0}
              >
                <BookOpen className="w-5 h-5" />
                Start Reading
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  <Heart className="w-4 h-4" />
                  Favorite
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <BookMarked className="w-4 h-4" />
                  Save
                </Button>
              </div>
              <Button variant="ghost" className="w-full gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            {/* Title & Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("capitalize", statusColors[manga.status])}
                >
                  {manga.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {manga.contentRating}
                </Badge>
                {manga.demographic && (
                  <Badge variant="secondary" className="capitalize">
                    {manga.demographic}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                {manga.title}
              </h1>

              {manga.altTitles.length > 0 && (
                <p className="text-muted-foreground text-sm">
                  Also known as: {manga.altTitles.slice(0, 3).join(', ')}
                </p>
              )}
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetaItem 
                icon={<User className="w-4 h-4" />}
                label="Author"
                value={manga.author}
              />
              <MetaItem 
                icon={<Palette className="w-4 h-4" />}
                label="Artist"
                value={manga.artist}
              />
              <MetaItem 
                icon={<Calendar className="w-4 h-4" />}
                label="Year"
                value={manga.year?.toString() || 'N/A'}
              />
              <MetaItem 
                icon={<BookOpen className="w-4 h-4" />}
                label="Chapters"
                value={manga.lastChapter || 'N/A'}
              />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {manga.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/browse?genre=${tag.toLowerCase()}`}
                  className="px-3 py-1.5 text-sm rounded-full bg-card hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Synopsis</h2>
              <div className={cn(
                "relative text-muted-foreground",
                !showFullDescription && "max-h-32 overflow-hidden"
              )}>
                <p className="whitespace-pre-line">{manga.description}</p>
                {!showFullDescription && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
                )}
              </div>
              {manga.description.length > 300 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="gap-1"
                >
                  {showFullDescription ? (
                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show More <ChevronDown className="w-4 h-4" /></>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="mt-12">
          <Tabs defaultValue="chapters" className="w-full">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="chapters" className="flex-1">
                Chapters ({totalChapters})
              </TabsTrigger>
              <TabsTrigger value="related" className="flex-1">
                Related
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chapters" className="mt-6">
              {/* Chapter Controls */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {chapters.length} chapters loaded
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChapterOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="gap-2"
                >
                  {chapterOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  {chapterOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </Button>
              </div>

              {/* Chapter List */}
              {loadingChapters ? (
                <div className="space-y-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : chapters.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No English chapters available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedChapters.map((chapter, index) => (
                    <Link
                      key={chapter.id}
                      to={`/read/${id}/chapter/${chapter.id}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-card/80 border border-border/50 hover:border-primary/30 transition-all group animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium group-hover:text-primary transition-colors">
                            Chapter {chapter.chapter || '?'}
                          </span>
                          {chapter.title && (
                            <span className="text-muted-foreground">- {chapter.title}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(chapter.publishedAt), { addSuffix: true })}
                          </span>
                          <span>{chapter.scanlationGroup}</span>
                          <span>{chapter.pages} pages</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="related" className="mt-6">
              <div className="text-center py-12 text-muted-foreground">
                <p>Related manga coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

// Meta Item Component
function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-card/50 border border-border/50">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        {icon}
        {label}
      </div>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}

// Loading Skeleton
function DetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-16">
      <div className="flex flex-col lg:flex-row gap-8">
        <Skeleton className="w-64 aspect-[2/3] rounded-xl mx-auto lg:mx-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
