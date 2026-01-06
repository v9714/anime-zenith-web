import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { mangaService, Chapter, MangaDetails } from "@/services/mangaService";
import { MANGA_API_URL } from "@/utils/constants";
import { getImageUrl } from "@/utils/commanFunction";
import { Button } from "@/components/ui/button";
import {
    Loader2, ChevronLeft, ChevronRight, Maximize2, Settings, List,
    Moon, Sun, BookOpen, X, Palette, ZoomIn, ZoomOut, RotateCcw,
    Monitor, Coffee
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import PdfViewer from "@/components/manga/PdfViewer";
import ChapterImagesViewer from "@/components/manga/ChapterImagesViewer";

type ReadingMode = 'default' | 'night' | 'sepia' | 'paper' | 'contrast';

interface ReadingModeConfig {
    name: string;
    icon: React.ReactNode;
    bgClass: string;
    overlayClass: string;
}

const readingModes: Record<ReadingMode, ReadingModeConfig> = {
    default: {
        name: 'Default',
        icon: <Monitor className="w-4 h-4" />,
        bgClass: 'bg-[#121212]',
        overlayClass: '',
    },
    night: {
        name: 'Night',
        icon: <Moon className="w-4 h-4" />,
        bgClass: 'bg-[#0a0a0a]',
        overlayClass: 'brightness-90 contrast-95',
    },
    sepia: {
        name: 'Sepia',
        icon: <Coffee className="w-4 h-4" />,
        bgClass: 'bg-[#f4ecd8]',
        overlayClass: 'sepia-[0.3] brightness-95',
    },
    paper: {
        name: 'Paper',
        icon: <BookOpen className="w-4 h-4" />,
        bgClass: 'bg-[#fafafa]',
        overlayClass: 'brightness-105',
    },
    contrast: {
        name: 'High Contrast',
        icon: <Sun className="w-4 h-4" />,
        bgClass: 'bg-black',
        overlayClass: 'contrast-125 brightness-95',
    },
};

const MangaReader = () => {
    const { mangaId, chapterId } = useParams();
    const navigate = useNavigate();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [manga, setManga] = useState<MangaDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [readingMode, setReadingMode] = useState<ReadingMode>('default');
    const [zoom, setZoom] = useState(100);
    const [showChapterList, setShowChapterList] = useState(false);
    const readerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Auto-hide controls
    const resetControlsTimeout = useCallback(() => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        setShowControls(true);
        controlsTimeoutRef.current = setTimeout(() => {
            if (!showChapterList) {
                setShowControls(false);
            }
        }, 3000);
    }, [showChapterList]);

    useEffect(() => {
        resetControlsTimeout();
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [resetControlsTimeout]);

    const handleMouseMove = () => {
        resetControlsTimeout();
    };

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

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const handleZoomReset = () => setZoom(100);

    const getPathUrl = (path: string | null) => {
        return getImageUrl(path || undefined, MANGA_API_URL) || "";
    };

    const isPdfFile = (path: string | null) => {
        return path?.toLowerCase().endsWith('.pdf');
    };

    const currentModeConfig = readingModes[readingMode];
    const currentChapterIndex = manga?.chapters.findIndex(c => c.id === chapter?.id) ?? -1;
    const hasPrev = currentChapterIndex > 0;
    const hasNext = currentChapterIndex < (manga?.chapters.length ?? 0) - 1;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-manga-dark">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-manga-neon-purple/30 rounded-full" />
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-manga-neon-pink rounded-full animate-spin" />
                </div>
                <p className="text-muted-foreground mt-6 animate-pulse">Loading chapter...</p>
            </div>
        );
    }

    if (!chapter) return <div className="text-center py-20 text-muted-foreground">Chapter not found.</div>;

    return (
        <div
            ref={readerRef}
            className={`flex flex-col h-screen overflow-hidden transition-colors duration-500 ${currentModeConfig.bgClass}`}
            onMouseMove={handleMouseMove}
        >
            {/* Top Navigation - Floating Toolbar */}
            <div className={`
                fixed top-0 left-0 right-0 z-30 transition-all duration-300
                ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
            `}>
                <div className="mx-4 mt-4">
                    <div className="backdrop-blur-xl bg-manga-glass/80 border border-manga-neon-purple/20 rounded-2xl shadow-2xl shadow-manga-neon-purple/10">
                        <div className="flex items-center justify-between px-4 py-3">
                            {/* Left Side - Back & Title */}
                            <div className="flex items-center gap-4">
                                <Link to={`/manga/${mangaId}`}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-manga-neon-pink hover:bg-manga-neon-pink/10 rounded-xl transition-all"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </Button>
                                </Link>
                                <div className="hidden sm:block">
                                    <h1 className="font-semibold text-sm line-clamp-1 text-foreground">{manga?.title}</h1>
                                    <p className="text-xs text-muted-foreground">
                                        Chapter {chapter.chapterNumber}: {chapter.title || "Untitled"}
                                    </p>
                                </div>
                            </div>

                            {/* Right Side - Controls */}
                            <div className="flex items-center gap-1 sm:gap-2">
                                {/* Zoom Controls */}
                                <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-xl bg-manga-glass/50 border border-manga-neon-purple/10">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleZoomOut}
                                        className="w-8 h-8 text-muted-foreground hover:text-manga-neon-cyan"
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </Button>
                                    <span className="text-xs font-medium text-muted-foreground w-12 text-center">{zoom}%</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleZoomIn}
                                        className="w-8 h-8 text-muted-foreground hover:text-manga-neon-cyan"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleZoomReset}
                                        className="w-8 h-8 text-muted-foreground hover:text-manga-neon-cyan"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Reading Mode Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-manga-neon-purple hover:bg-manga-neon-purple/10 rounded-xl"
                                        >
                                            <Palette className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="backdrop-blur-xl bg-manga-glass/95 border border-manga-neon-purple/20 rounded-xl shadow-2xl min-w-[180px]"
                                        align="end"
                                    >
                                        <DropdownMenuLabel className="text-muted-foreground text-xs">Reading Mode</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-manga-neon-purple/10" />
                                        {Object.entries(readingModes).map(([key, config]) => (
                                            <DropdownMenuItem
                                                key={key}
                                                onClick={() => setReadingMode(key as ReadingMode)}
                                                className={`
                                                    flex items-center gap-3 cursor-pointer rounded-lg
                                                    ${readingMode === key
                                                        ? 'bg-manga-neon-purple/20 text-manga-neon-purple'
                                                        : 'text-foreground hover:bg-manga-glass/50'
                                                    }
                                                `}
                                            >
                                                {config.icon}
                                                <span>{config.name}</span>
                                                {readingMode === key && (
                                                    <div className="ml-auto w-2 h-2 rounded-full bg-manga-neon-purple" />
                                                )}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Chapter List Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowChapterList(!showChapterList)}
                                    className={`
                                        text-muted-foreground hover:text-manga-neon-pink hover:bg-manga-neon-pink/10 rounded-xl
                                        ${showChapterList ? 'bg-manga-neon-pink/10 text-manga-neon-pink' : ''}
                                    `}
                                >
                                    <List className="w-5 h-5" />
                                </Button>

                                {/* Fullscreen */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleFullscreen}
                                    className="text-muted-foreground hover:text-manga-neon-cyan hover:bg-manga-neon-cyan/10 rounded-xl"
                                >
                                    <Maximize2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapter List Sidebar */}
            <div className={`
                fixed top-0 right-0 h-full w-80 z-40 transition-transform duration-300
                ${showChapterList ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="h-full backdrop-blur-xl bg-manga-glass/95 border-l border-manga-neon-purple/20 shadow-2xl">
                    <div className="flex items-center justify-between p-4 border-b border-manga-neon-purple/10">
                        <h3 className="font-bold text-foreground">Chapters</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowChapterList(false)}
                            className="text-muted-foreground hover:text-manga-neon-pink"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="overflow-y-auto h-[calc(100%-60px)] p-2">
                        {manga?.chapters.map((ch) => (
                            <button
                                key={ch.id}
                                onClick={() => {
                                    navigate(`/read/${mangaId}/chapter/${ch.id}`);
                                    setShowChapterList(false);
                                }}
                                className={`
                                    w-full text-left p-3 rounded-xl mb-1 transition-all
                                    ${ch.id === chapter.id
                                        ? 'bg-gradient-to-r from-manga-neon-purple/30 to-manga-neon-pink/30 border border-manga-neon-purple/30'
                                        : 'hover:bg-manga-glass/50'
                                    }
                                `}
                            >
                                <div className={`font-medium text-sm ${ch.id === chapter.id ? 'text-manga-neon-pink' : 'text-foreground'}`}>
                                    Chapter {ch.chapterNumber}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                    {ch.title || "Untitled"}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reader Area */}
            <div className={`flex-1 relative overflow-auto ${currentModeConfig.overlayClass}`}>
                {isPdfFile(chapter.pdfUrl) ? (
                    <PdfViewer
                        pdfUrl={getPathUrl(chapter.pdfUrl)}
                        zoom={zoom}
                        onZoomChange={setZoom}
                        overlayClass={currentModeConfig.overlayClass}
                    />
                ) : (
                    <ChapterImagesViewer
                        imagesUrl={getPathUrl(chapter.pdfUrl)}
                        pagesCount={chapter.pagesCount || 0}
                        zoom={zoom}
                        overlayClass={currentModeConfig.overlayClass}
                    />
                )}

                {/* Side Navigation Overlays */}
                <button
                    onClick={handlePrevChapter}
                    disabled={!hasPrev}
                    className={`
                        absolute top-1/2 -translate-y-1/2 left-0 w-12 md:w-16 h-24
                        flex items-center justify-center
                        transition-all group z-20
                        ${hasPrev ? 'hover:bg-gradient-to-r hover:from-manga-dark/60 to-transparent cursor-pointer' : 'cursor-not-allowed opacity-50'}
                    `}
                >
                    <div className={`
                        opacity-0 group-hover:opacity-100 transition-all
                        w-10 h-10 rounded-full bg-manga-glass/80 backdrop-blur-sm
                        flex items-center justify-center
                        border border-manga-neon-purple/30 shadow-lg
                        ${hasPrev ? 'group-hover:scale-110' : ''}
                    `}>
                        <ChevronLeft className="w-5 h-5 text-manga-neon-purple" />
                    </div>
                </button>

                <button
                    onClick={handleNextChapter}
                    disabled={!hasNext}
                    className={`
                        absolute top-1/2 -translate-y-1/2 right-0 w-12 md:w-16 h-24
                        flex items-center justify-center
                        transition-all group z-20
                        ${hasNext ? 'hover:bg-gradient-to-l hover:from-manga-dark/60 to-transparent cursor-pointer' : 'cursor-not-allowed opacity-50'}
                    `}
                >
                    <div className={`
                        opacity-0 group-hover:opacity-100 transition-all
                        w-10 h-10 rounded-full bg-manga-glass/80 backdrop-blur-sm
                        flex items-center justify-center
                        border border-manga-neon-pink/30 shadow-lg
                        ${hasNext ? 'group-hover:scale-110' : ''}
                    `}>
                        <ChevronRight className="w-5 h-5 text-manga-neon-pink" />
                    </div>
                </button>
            </div>

            {/* Bottom Controls - Floating */}
            <div className={`
                fixed bottom-0 left-0 right-0 z-30 transition-all duration-300
                ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
            `}>
                <div className="mx-4 mb-4">
                    <div className="backdrop-blur-xl bg-manga-glass/80 border border-manga-neon-purple/20 rounded-2xl shadow-2xl shadow-manga-neon-purple/10">
                        <div className="flex items-center justify-center gap-4 sm:gap-6 py-4 px-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrevChapter}
                                disabled={!hasPrev}
                                className="text-xs gap-2 text-muted-foreground hover:text-manga-neon-purple hover:bg-manga-neon-purple/10 disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </Button>

                            {/* Chapter Indicator */}
                            <div className="flex items-center gap-3 px-5 py-2 bg-gradient-to-r from-manga-neon-purple/20 to-manga-neon-pink/20 rounded-full border border-manga-neon-purple/20">
                                <List className="w-4 h-4 text-manga-neon-purple" />
                                <span className="text-sm font-medium text-foreground">
                                    Chapter {chapter.chapterNumber}
                                    <span className="text-muted-foreground ml-1">/ {manga?.chapters.length}</span>
                                </span>
                            </div>

                            <Button
                                size="sm"
                                onClick={handleNextChapter}
                                disabled={!hasNext}
                                className="text-xs gap-2 bg-gradient-to-r from-manga-neon-purple to-manga-neon-pink hover:from-manga-neon-pink hover:to-manga-neon-purple text-white border-none h-9 px-4 disabled:opacity-30"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Mobile Zoom Slider */}
                        <div className="md:hidden px-6 pb-4">
                            <div className="flex items-center gap-3">
                                <ZoomOut className="w-4 h-4 text-muted-foreground" />
                                <Slider
                                    value={[zoom]}
                                    onValueChange={(val) => setZoom(val[0])}
                                    min={50}
                                    max={200}
                                    step={10}
                                    className="flex-1"
                                />
                                <ZoomIn className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground w-10">{zoom}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Click to show controls - positioned outside scroll area */}
            {!showControls && (
                <button
                    className="absolute top-3 left-4 z-20 w-11 h-11 rounded-full bg-manga-glass/60 backdrop-blur-sm border border-manga-neon-purple/20 flex items-center justify-center hover:bg-manga-glass/80 transition-all"
                    onClick={() => setShowControls(true)}
                    aria-label="Show controls"
                >
                    <Settings className="w-5 h-5 text-manga-neon-purple" />
                </button>
            )}
        </div>
    );
};

export default MangaReader;
