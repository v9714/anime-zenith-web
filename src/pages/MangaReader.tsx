
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { mangaService, Chapter, MangaDetails } from "@/services/mangaService";
import { MANGA_API_URL } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Maximize2, Settings, List } from "lucide-react";
import { toast } from "sonner";

const MangaReader = () => {
    const { mangaId, chapterId } = useParams();
    const navigate = useNavigate();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [manga, setManga] = useState<MangaDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const readerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!mangaId || !chapterId) return;
            setLoading(true);
            try {
                const [chapRes, mangaRes] = await Promise.all([
                    mangaService.getChapterDetails(parseInt(chapterId)),
                    mangaService.getMangaDetails(parseInt(mangaId))
                ]);

                if (chapRes.success) setChapter(chapRes.data);
                if (mangaRes.success) setManga(mangaRes.data);

                // Save initial progress for this chapter
                await mangaService.updateProgress({
                    mangaId: parseInt(mangaId),
                    chapterId: parseInt(chapterId),
                    lastPage: 1
                });
            } catch (error) {
                console.error("Error loading chapter:", error);
                toast.error("Failed to load chapter");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [mangaId, chapterId]);

    const handleNextChapter = () => {
        if (!manga || !chapter) return;
        const currentIndex = manga.chapters.findIndex(c => c.id === chapter.id);
        if (currentIndex < manga.chapters.length - 1) {
            const nextChap = manga.chapters[currentIndex + 1];
            navigate(`/read/${mangaId}/chapter/${nextChap.id}`);
        } else {
            toast.info("You've reached the latest chapter!");
        }
    };

    const handlePrevChapter = () => {
        if (!manga || !chapter) return;
        const currentIndex = manga.chapters.findIndex(c => c.id === chapter.id);
        if (currentIndex > 0) {
            const prevChap = manga.chapters[currentIndex - 1];
            navigate(`/read/${mangaId}/chapter/${prevChap.id}`);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            readerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const getPdfUrl = (path: string | null) => {
        if (!path) return "";
        return `${MANGA_API_URL}/${path.replace(/\\/g, '/')}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="animate-pulse">Opening grimoire...</p>
            </div>
        );
    }

    if (!chapter) return <div className="text-center py-20">Chapter not found.</div>;

    return (
        <div ref={readerRef} className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden">
            {/* Top Navigation */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-md border-b border-white/5 z-20">
                <div className="flex items-center gap-4">
                    <Link to={`/manga/${mangaId}`}>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/10">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-semibold text-sm md:text-base line-clamp-1">{manga?.title}</h1>
                        <p className="text-xs text-muted-foreground">Chapter {chapter.chapterNumber}: {chapter.title || "Untitled"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-muted-foreground hover:text-white">
                        <Maximize2 className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Reader Area */}
            <div className="flex-1 relative bg-[#121212] overflow-hidden flex items-center justify-center">
                <iframe
                    src={`${getPdfUrl(chapter.pdfUrl)}#toolbar=0&navpanes=0&view=FitH`}
                    className="w-full h-full border-none shadow-2xl"
                    title="Manga Viewer"
                />

                {/* Navigation Overlays (Hidden on mobile) */}
                <div className="absolute inset-y-0 left-0 w-24 hover:bg-gradient-to-r hover:from-black/40 to-transparent flex items-center justify-start pl-4 group transition-all">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevChapter}
                        className="opacity-0 group-hover:opacity-100 bg-black/50 text-white rounded-full w-12 h-12"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </Button>
                </div>
                <div className="absolute inset-y-0 right-0 w-24 hover:bg-gradient-to-l hover:from-black/40 to-transparent flex items-center justify-end pr-4 group transition-all">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNextChapter}
                        className="opacity-0 group-hover:opacity-100 bg-black/50 text-white rounded-full w-12 h-12"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </Button>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-center gap-6 py-4 bg-black/80 backdrop-blur-md border-t border-white/5 z-20">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevChapter}
                    disabled={manga?.chapters.findIndex(c => c.id === chapter.id) === 0}
                    className="text-xs gap-2"
                >
                    <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <List className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-medium">Chapter {chapter.chapterNumber}</span>
                </div>

                <Button
                    variant="default"
                    size="sm"
                    onClick={handleNextChapter}
                    className="text-xs gap-2 bg-purple-600 hover:bg-purple-700 h-9 px-4"
                >
                    Next Chapter <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default MangaReader;
