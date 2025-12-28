import React, { useState, useEffect, useCallback } from "react";
import { Loader2, FileWarning, ChevronLeft, ChevronRight, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChapterImagesViewerProps {
    imagesUrl: string;
    pagesCount: number;
    zoom: number;
    overlayClass?: string;
}

const ChapterImagesViewer: React.FC<ChapterImagesViewerProps> = ({
    imagesUrl,
    pagesCount,
    zoom,
    overlayClass = "",
}) => {
    const [loading, setLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [viewMode, setViewMode] = useState<'single' | 'continuous'>('continuous');
    const [error, setError] = useState<Record<number, boolean>>({});

    const baseUrl = imagesUrl.endsWith("/") ? imagesUrl : `${imagesUrl}/`;

    const handleImageLoad = (page: number) => {
        setLoadedImages(prev => ({ ...prev, [page]: true }));
    };

    const handleImageError = (page: number) => {
        setError(prev => ({ ...prev, [page]: true }));
    };

    useEffect(() => {
        // Simple loading heuristic
        const loadedCount = Object.keys(loadedImages).length;
        if (loadedCount >= Math.min(pagesCount, 3) || pagesCount === 0) {
            setLoading(false);
        }
    }, [loadedImages, pagesCount]);

    const pages = Array.from({ length: pagesCount }, (_, i) => i + 1);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagesCount) {
            setCurrentPage(page);
            if (viewMode === 'continuous') {
                document.getElementById(`image-page-${page}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <div className={`flex flex-col h-full ${overlayClass}`}>
            {/* Secondary Toolbar (Matching PdfViewer style) */}
            <div className="sticky top-0 z-10 backdrop-blur-xl bg-manga-glass/90 border-b border-manga-neon-purple/20 p-2 sm:p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap max-w-7xl mx-auto">
                    {/* Page Navigation */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="h-8 w-8 text-muted-foreground hover:text-manga-neon-purple"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-manga-glass/50 border border-manga-neon-purple/10">
                            <span className="text-sm font-medium text-foreground">{currentPage}</span>
                            <span className="text-muted-foreground text-sm">/ {pagesCount}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage >= pagesCount}
                            className="h-8 w-8 text-muted-foreground hover:text-manga-neon-purple"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-manga-glass/50 border border-manga-neon-purple/10">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('single')}
                            className={`h-7 px-2 text-xs ${viewMode === 'single' ? 'bg-manga-neon-purple/20 text-manga-neon-purple' : 'text-muted-foreground'}`}
                        >
                            <FileText className="w-3 h-3 mr-1" />
                            Single
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('continuous')}
                            className={`h-7 px-2 text-xs ${viewMode === 'continuous' ? 'bg-manga-neon-purple/20 text-manga-neon-purple' : 'text-muted-foreground'}`}
                        >
                            <BookOpen className="w-3 h-3 mr-1" />
                            Scroll
                        </Button>
                    </div>
                </div>
            </div>

            {/* Images Content */}
            <div className="flex-1 overflow-auto flex justify-center bg-black/20">
                <div
                    className="flex flex-col items-center transition-all duration-300 w-full"
                    style={{
                        maxWidth: viewMode === 'single' ? 'none' : `${zoom}%`,
                        width: viewMode === 'single' ? '100%' : 'auto'
                    }}
                >
                    {viewMode === 'single' ? (
                        <div className="relative w-full h-[calc(100vh-140px)] flex items-center justify-center p-2 sm:p-4">
                            <div className="h-full shadow-2xl shadow-manga-neon-purple/20 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center">
                                <ImageWithFallback
                                    src={`${baseUrl}${currentPage}`}
                                    page={currentPage}
                                    baseUrl={baseUrl}
                                    onLoaded={() => handleImageLoad(currentPage)}
                                    onError={() => handleImageError(currentPage)}
                                    isError={error[currentPage]}
                                    className="max-h-full w-auto object-contain"
                                />
                            </div>
                        </div>
                    ) : (
                        pages.map((page) => (
                            <div
                                key={page}
                                id={`image-page-${page}`}
                                className="relative w-full shadow-2xl shadow-manga-neon-purple/10 border-b border-white/5 last:border-b-0"
                            >
                                <ImageWithFallback
                                    src={`${baseUrl}${page}`}
                                    page={page}
                                    baseUrl={baseUrl}
                                    onLoaded={() => handleImageLoad(page)}
                                    onError={() => handleImageError(page)}
                                    isError={error[page]}
                                    className="w-full h-auto object-contain"
                                />
                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white/70 font-medium">
                                    Page {page}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const ImageWithFallback: React.FC<{
    src: string;
    page: number;
    baseUrl: string;
    onLoaded: () => void;
    onError: () => void;
    isError: boolean;
    className?: string;
}> = ({ src, page, baseUrl, onLoaded, onError, isError, className }) => {
    const [currentSrc, setCurrentSrc] = useState(`${src}.png`);
    const [retryCount, setRetryCount] = useState(0);

    const fallbacks = [".png", ".jpg", ".jpeg", ".webp"];

    const handleError = () => {
        if (retryCount < fallbacks.length - 1) {
            const nextExt = fallbacks[retryCount + 1];
            setCurrentSrc(`${baseUrl}${page}${nextExt}`);
            setRetryCount(prev => prev + 1);
        } else {
            onError();
        }
    };

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-manga-glass/20 rounded-lg">
                <FileWarning className="w-12 h-12 text-destructive mb-2" />
                <p className="text-sm text-muted-foreground">Failed to load page {page}</p>
            </div>
        );
    }

    return (
        <img
            src={currentSrc}
            alt={`Page ${page}`}
            className={className}
            onLoad={onLoaded}
            onError={handleError}
            loading="lazy"
        />
    );
};

export default ChapterImagesViewer;
