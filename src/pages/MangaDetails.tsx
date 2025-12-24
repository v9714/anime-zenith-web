
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mangaService, MangaDetails, MangaProgress } from "@/services/mangaService";
import { MANGA_API_URL } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, User, Star, ChevronRight, Play } from "lucide-react";

const MangaDetailsPage = () => {
    const { id } = useParams();
    const [manga, setManga] = useState<MangaDetails | null>(null);
    const [progress, setProgress] = useState<MangaProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [mangaRes, progressRes] = await Promise.all([
                    mangaService.getMangaDetails(parseInt(id)),
                    mangaService.getProgress(parseInt(id))
                ]);

                if (mangaRes.success) setManga(mangaRes.data);
                if (progressRes.success) setProgress(progressRes.data);
            } catch (error) {
                console.error("Error fetching manga details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getImageUrl = (path: string | null) => {
        if (!path) return "/placeholder-manga.jpg";
        if (path.startsWith('http')) return path;
        return `${MANGA_API_URL}/${path.replace(/\\/g, '/')}`;
    };

    if (loading) return <DetailsSkeleton />;
    if (!manga) return <div className="text-center py-20">Manga not found.</div>;

    const lastReadChapter = progress?.chapter?.chapterNumber || 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Banner Section */}
            <div className="relative h-[400px] w-full overflow-hidden">
                <img
                    src={getImageUrl(manga.bannerImage || manga.coverImage)}
                    alt={manga.title}
                    className="w-full h-full object-cover blur-sm brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 -mt-64 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Cover Art */}
                    <div className="w-64 flex-shrink-0 mx-auto md:mx-0">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5 bg-muted">
                            <img
                                src={getImageUrl(manga.coverImage)}
                                alt={manga.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 gap-2 shadow-lg shadow-purple-500/20">
                            {lastReadChapter ? (
                                <Link to={`/read/${manga.id}/chapter/${progress?.chapterId}`} className="flex items-center gap-2">
                                    <Play className="w-5 h-5 fill-current" /> Continue Reading (Ch. {lastReadChapter})
                                </Link>
                            ) : (
                                <Link to={manga.chapters.length > 0 ? `/read/${manga.id}/chapter/${manga.chapters[0].id}` : "#"} className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" /> Start Reading
                                </Link>
                            )}
                        </Button>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 text-center md:text-left pt-4">
                        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-4">
                            <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                Manga
                            </Badge>
                            <Badge variant="outline" className="text-muted-foreground">
                                {manga.status}
                            </Badge>
                            {manga.rating && (
                                <div className="flex items-center gap-1 text-yellow-500 font-bold ml-2">
                                    <Star className="w-4 h-4 fill-current" />
                                    {Number(manga.rating).toFixed(1)}
                                </div>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{manga.title}</h1>
                        <p className="text-xl text-muted-foreground mb-6 font-medium">{manga.alternativeTitles.join(", ")}</p>

                        <div className="flex flex-wrap gap-6 justify-center md:justify-start text-sm text-muted-foreground mb-8">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-400" />
                                <span>Author: <span className="text-foreground">{manga.author || "Unknown"}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                <span>Updated: <span className="text-foreground">{new Date(manga.updatedAt).toLocaleDateString()}</span></span>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {manga.description || "No description available for this manga."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chapters List */}
                <div className="mt-16 pb-20">
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-purple-400" />
                            Chapters
                            <span className="text-sm font-normal text-muted-foreground bg-white/5 px-2 py-0.5 rounded ml-2">
                                {manga.chapters.length} Total
                            </span>
                        </h2>
                    </div>

                    <div className="grid gap-3">
                        {manga.chapters.map((chapter) => (
                            <Link
                                key={chapter.id}
                                to={`/read/${manga.id}/chapter/${chapter.id}`}
                                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-purple-500/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg transition-colors ${lastReadChapter >= chapter.chapterNumber ? 'bg-purple-600/20 text-purple-400' : 'bg-white/5 text-muted-foreground group-hover:bg-white/10'}`}>
                                        {chapter.chapterNumber}
                                    </div>
                                    <div>
                                        <div className="font-medium group-hover:text-purple-400 transition-colors">
                                            {chapter.title || `Chapter ${chapter.chapterNumber}`}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                                            <span>{new Date(chapter.createdAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{chapter.views} views</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {lastReadChapter >= chapter.chapterNumber && (
                                        <Badge variant="outline" className="hidden sm:flex border-purple-500/30 text-purple-400 bg-purple-500/5">
                                            Read
                                        </Badge>
                                    )}
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailsSkeleton = () => (
    <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-64 h-96 rounded-2xl mx-auto md:mx-0" />
            <div className="flex-1 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-2 pt-8">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        </div>
    </div>
);

export default MangaDetailsPage;
