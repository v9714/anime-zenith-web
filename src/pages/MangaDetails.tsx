import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mangaService, MangaDetails, MangaProgress } from "@/services/mangaService";
import { MANGA_API_URL } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, User, Star, ChevronRight, Play, Sparkles, Eye, Clock, ArrowLeft } from "lucide-react";

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
    if (!manga) return <div className="text-center py-20 text-muted-foreground">Manga not found.</div>;

    const lastReadChapter = progress?.chapter?.chapterNumber || 0;
    const firstChapterId = manga.chapters.length > 0 ? manga.chapters[0].id : null;

    return (
        <div className="min-h-screen bg-manga-dark">
            {/* Cinematic Banner Section */}
            <div className="relative h-[500px] w-full overflow-hidden">
                {/* Banner Image */}
                <img
                    src={getImageUrl(manga.bannerImage || manga.coverImage)}
                    alt={manga.title}
                    className="w-full h-full object-cover scale-105"
                />

                {/* Multiple Overlay Layers */}
                <div className="absolute inset-0 bg-manga-dark/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-manga-dark via-manga-dark/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-manga-dark/80 via-transparent to-manga-dark/80" />

                {/* Neon Accent Lines */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-manga-neon-purple to-transparent opacity-60" />

                {/* Back Button */}
                <Link
                    to="/manga"
                    className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-manga-glass/50 backdrop-blur-md border border-manga-neon-purple/20 text-foreground hover:bg-manga-glass/80 hover:border-manga-neon-purple/40 transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back</span>
                </Link>
            </div>

            <div className="container mx-auto px-4 -mt-72 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Cover Art with Glow */}
                    <div className="w-64 flex-shrink-0 mx-auto lg:mx-0">
                        <div className="relative group">
                            {/* Glow Effect */}
                            <div className="absolute -inset-2 bg-gradient-to-br from-manga-neon-purple via-manga-neon-pink to-manga-neon-cyan rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />

                            {/* Cover Container */}
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-manga-neon-purple/30 shadow-2xl shadow-manga-neon-purple/20">
                                <img
                                    src={getImageUrl(manga.coverImage)}
                                    alt={manga.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* CTA Button with Pulsating Glow */}
                        <div className="mt-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-manga-neon-purple to-manga-neon-pink rounded-xl blur-lg opacity-50 animate-glow-pulse" />
                            <Button
                                className="relative w-full h-14 bg-gradient-to-r from-manga-neon-purple to-manga-neon-pink hover:from-manga-neon-pink hover:to-manga-neon-purple text-white rounded-xl font-bold text-base shadow-lg transition-all duration-300 border-none"
                                asChild
                            >
                                {lastReadChapter ? (
                                    <Link to={`/read/${manga.id}/chapter/${progress?.chapterId}`} className="flex items-center justify-center gap-3">
                                        <Play className="w-5 h-5 fill-current" />
                                        Continue Ch. {lastReadChapter}
                                    </Link>
                                ) : (
                                    <Link to={firstChapterId ? `/read/${manga.id}/chapter/${firstChapterId}` : "#"} className="flex items-center justify-center gap-3">
                                        <BookOpen className="w-5 h-5" />
                                        Start Reading
                                    </Link>
                                )}
                            </Button>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="backdrop-blur-xl bg-manga-glass/50 border border-manga-neon-purple/20 rounded-xl p-3 text-center">
                                <Eye className="w-4 h-4 text-manga-neon-cyan mx-auto mb-1" />
                                <p className="text-xs text-muted-foreground">Views</p>
                                <p className="text-sm font-bold text-foreground">12.5K</p>
                            </div>
                            <div className="backdrop-blur-xl bg-manga-glass/50 border border-manga-neon-purple/20 rounded-xl p-3 text-center">
                                <Star className="w-4 h-4 text-manga-neon-pink mx-auto mb-1" />
                                <p className="text-xs text-muted-foreground">Rating</p>
                                <p className="text-sm font-bold text-foreground">{manga.rating ? Number(manga.rating).toFixed(1) : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="flex-1 pt-4 lg:pt-8">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start mb-6">
                            <Badge className="bg-gradient-to-r from-manga-neon-purple to-manga-neon-pink text-white border-none px-3 py-1 font-semibold">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Manga
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`
                                    border-manga-neon-cyan/50 text-manga-neon-cyan
                                    ${manga.status?.toLowerCase() === 'ongoing' ? 'border-manga-neon-pink/50 text-manga-neon-pink' : ''}
                                `}
                            >
                                {manga.status}
                            </Badge>
                            {manga.rating && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-manga-glass/50 border border-yellow-500/30">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    <span className="text-yellow-500 font-bold text-sm">{Number(manga.rating).toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        {/* Genres */}
                        {manga.genres && manga.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start">
                                {manga.genres.map((mg) => (
                                    <Badge
                                        key={mg.genre.id}
                                        variant="outline"
                                        className="border-manga-neon-purple/30 text-manga-neon-purple hover:bg-manga-neon-purple/10 transition-colors"
                                    >
                                        {mg.genre.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 tracking-tight text-center lg:text-left">
                            <span className="bg-gradient-to-r from-foreground via-foreground to-manga-neon-purple bg-clip-text">
                                {manga.title}
                            </span>
                        </h1>

                        {/* Alternative Titles */}
                        {manga.alternativeTitles.length > 0 && (
                            <p className="text-lg text-muted-foreground mb-8 text-center lg:text-left font-medium">
                                {manga.alternativeTitles.join(" • ")}
                            </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm mb-8">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-manga-glass/30 border border-manga-neon-purple/10">
                                <User className="w-4 h-4 text-manga-neon-purple" />
                                <span className="text-muted-foreground">Author:</span>
                                <span className="text-foreground font-medium">{manga.author || "Unknown"}</span>
                            </div>
                            {manga.releaseYear && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-manga-glass/30 border border-manga-neon-purple/10">
                                    <Sparkles className="w-4 h-4 text-manga-neon-cyan" />
                                    <span className="text-muted-foreground">Year:</span>
                                    <span className="text-foreground font-medium">{manga.releaseYear}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-manga-glass/30 border border-manga-neon-purple/10">
                                <Calendar className="w-4 h-4 text-manga-neon-pink" />
                                <span className="text-muted-foreground">Updated:</span>
                                <span className="text-foreground font-medium">{new Date(manga.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Synopsis - Glassmorphism Card */}
                        <div className="relative group">
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-manga-neon-purple/30 via-manga-neon-pink/30 to-manga-neon-cyan/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                            <div className="relative backdrop-blur-xl bg-manga-glass/40 rounded-2xl p-6 border border-manga-neon-purple/20">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-gradient-to-b from-manga-neon-purple to-manga-neon-pink rounded-full" />
                                    Synopsis
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {manga.description || "No description available for this manga."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chapters List */}
                <div className="mt-20 pb-20">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-manga-neon-purple to-manga-neon-pink">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span>Chapters</span>
                            <span className="ml-2 text-sm font-normal text-muted-foreground px-3 py-1 bg-manga-glass/50 rounded-full border border-manga-neon-purple/20">
                                {manga.chapters.length} Total
                            </span>
                        </h2>
                    </div>

                    {/* Chapters Grid */}
                    <div className="grid gap-3">
                        {manga.chapters.map((chapter, index) => {
                            const isRead = lastReadChapter >= chapter.chapterNumber;
                            return (
                                <Link
                                    key={chapter.id}
                                    to={`/read/${manga.id}/chapter/${chapter.id}`}
                                    className="group relative"
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute -inset-[1px] bg-gradient-to-r from-manga-neon-purple via-manga-neon-pink to-manga-neon-cyan rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />

                                    {/* Chapter Row - Glassmorphism */}
                                    <div className={`
                                        relative flex items-center justify-between p-4 rounded-xl
                                        backdrop-blur-sm bg-manga-glass/40 border border-manga-neon-purple/10
                                        group-hover:bg-manga-glass/60 group-hover:border-transparent
                                        transition-all duration-300
                                    `}>
                                        <div className="flex items-center gap-4">
                                            {/* Chapter Number */}
                                            <div className={`
                                                w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg
                                                transition-all duration-300
                                                ${isRead
                                                    ? 'bg-gradient-to-br from-manga-neon-purple/30 to-manga-neon-pink/30 text-manga-neon-pink border border-manga-neon-pink/30'
                                                    : 'bg-manga-glass/50 text-muted-foreground border border-manga-neon-purple/10 group-hover:bg-manga-neon-purple/20 group-hover:text-manga-neon-purple group-hover:border-manga-neon-purple/30'
                                                }
                                            `}>
                                                {chapter.chapterNumber}
                                            </div>

                                            <div>
                                                <div className="font-semibold text-foreground group-hover:text-manga-neon-pink transition-colors duration-300">
                                                    {chapter.title || `Chapter ${chapter.chapterNumber}`}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(chapter.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {chapter.views} views
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {isRead && (
                                                <Badge className="hidden sm:flex bg-manga-neon-purple/20 text-manga-neon-purple border border-manga-neon-purple/30 font-medium">
                                                    Read
                                                </Badge>
                                            )}
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-manga-neon-pink group-hover:translate-x-1 transition-all duration-300" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailsSkeleton = () => (
    <div className="min-h-screen bg-manga-dark">
        <div className="h-[500px] bg-manga-glass animate-pulse" />
        <div className="container mx-auto px-4 -mt-72 relative z-10">
            <div className="flex flex-col lg:flex-row gap-8">
                <Skeleton className="w-64 h-96 rounded-2xl mx-auto lg:mx-0 bg-manga-glass" />
                <div className="flex-1 space-y-4 pt-8">
                    <Skeleton className="h-6 w-32 bg-manga-glass" />
                    <Skeleton className="h-14 w-3/4 bg-manga-glass" />
                    <Skeleton className="h-8 w-1/2 bg-manga-glass" />
                    <div className="space-y-3 pt-8">
                        <Skeleton className="h-4 w-full bg-manga-glass" />
                        <Skeleton className="h-4 w-full bg-manga-glass" />
                        <Skeleton className="h-4 w-2/3 bg-manga-glass" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default MangaDetailsPage;
