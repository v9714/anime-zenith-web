import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Maximize2,
    Minimize2,
    BookOpen,
    FileText,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    pdfUrl: string;
    title?: string;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    overlayClass?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
    pdfUrl,
    title = 'Document',
    zoom,
    onZoomChange,
    overlayClass = '',
}) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'single' | 'continuous'>('continuous');
    const [containerWidth, setContainerWidth] = useState<number>(800);

    // Responsive container sizing
    useEffect(() => {
        const updateWidth = () => {
            const width = Math.min(window.innerWidth - 32, 1200);
            setContainerWidth(width);
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
    }, []);

    const onDocumentLoadError = useCallback((error: Error) => {
        console.error('PDF load error:', error);
        setError('Failed to load PDF. Please try again.');
        setLoading(false);
        toast.error('Failed to load PDF');
    }, []);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= numPages) {
            setCurrentPage(page);
            if (viewMode === 'continuous') {
                const pageElement = document.getElementById(`page-${page}`);
                pageElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const handleDownload = async () => {
        try {
            toast.loading('Preparing download...');
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title.replace(/\s+/g, '-')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success('Download started!');
        } catch (err) {
            toast.dismiss();
            toast.error('Failed to download PDF');
            console.error('Download error:', err);
        }
    };

    const handleOpenInNewTab = () => {
        window.open(pdfUrl, '_blank');
    };

    const pageWidth = Math.min(containerWidth * (zoom / 100), containerWidth);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-center space-y-4">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">{error}</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <Button
                            onClick={handleOpenInNewTab}
                            className="gap-2 bg-gradient-to-r from-manga-neon-purple to-manga-neon-pink"
                        >
                            <Maximize2 className="w-4 h-4" />
                            Open PDF
                        </Button>
                        <Button onClick={handleDownload} variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full ${overlayClass}`}>
            {/* Toolbar */}
            <div className="sticky top-0 z-10 backdrop-blur-xl bg-manga-glass/90 border-b border-manga-neon-purple/20 p-2 sm:p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Page Navigation */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-manga-neon-purple"
                        >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-manga-glass/50 border border-manga-neon-purple/10">
                            <input
                                type="number"
                                value={currentPage}
                                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                                min={1}
                                max={numPages}
                                className="w-10 sm:w-12 text-center bg-transparent text-sm font-medium text-foreground outline-none"
                            />
                            <span className="text-muted-foreground text-sm">/ {numPages || '?'}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage >= numPages}
                            className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-manga-neon-purple"
                        >
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-manga-glass/50 border border-manga-neon-purple/10">
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

                    {/* Zoom Controls */}
                    <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-manga-glass/50 border border-manga-neon-purple/10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onZoomChange(Math.max(50, zoom - 10))}
                            className="w-7 h-7 text-muted-foreground hover:text-manga-neon-cyan"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-xs font-medium text-muted-foreground w-10 text-center">{zoom}%</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onZoomChange(Math.min(200, zoom + 10))}
                            className="w-7 h-7 text-muted-foreground hover:text-manga-neon-cyan"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onZoomChange(100)}
                            className="w-7 h-7 text-muted-foreground hover:text-manga-neon-cyan"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                            onClick={handleOpenInNewTab}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 sm:px-3 text-xs gap-1 text-muted-foreground hover:text-manga-neon-cyan"
                        >
                            <Maximize2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Open</span>
                        </Button>
                        <Button
                            onClick={handleDownload}
                            size="sm"
                            className="h-8 px-2 sm:px-3 text-xs gap-1 bg-gradient-to-r from-manga-neon-purple to-manga-neon-pink hover:from-manga-neon-pink hover:to-manga-neon-purple text-white"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile Zoom Slider */}
                <div className="md:hidden mt-2 flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-muted-foreground" />
                    <Slider
                        value={[zoom]}
                        onValueChange={(val) => onZoomChange(val[0])}
                        min={50}
                        max={200}
                        step={10}
                        className="flex-1"
                    />
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground w-10">{zoom}%</span>
                </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-auto p-4 flex justify-center">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-manga-neon-purple/30 rounded-full" />
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-manga-neon-pink rounded-full animate-spin" />
                        </div>
                        <p className="text-muted-foreground mt-4 animate-pulse">Loading PDF...</p>
                    </div>
                )}

                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                    className="flex flex-col items-center gap-4"
                >
                    {viewMode === 'single' ? (
                        <Page
                            pageNumber={currentPage}
                            width={pageWidth}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="shadow-2xl shadow-manga-neon-purple/20 rounded-lg overflow-hidden"
                            loading={
                                <div className="flex items-center justify-center h-[600px] bg-manga-glass/50 rounded-lg">
                                    <Loader2 className="w-8 h-8 animate-spin text-manga-neon-purple" />
                                </div>
                            }
                        />
                    ) : (
                        Array.from(new Array(numPages), (_, index) => (
                            <div key={`page_${index + 1}`} id={`page-${index + 1}`}>
                                <Page
                                    pageNumber={index + 1}
                                    width={pageWidth}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="shadow-2xl shadow-manga-neon-purple/20 rounded-lg overflow-hidden mb-4"
                                    loading={
                                        <div className="flex items-center justify-center h-[600px] bg-manga-glass/50 rounded-lg">
                                            <Loader2 className="w-8 h-8 animate-spin text-manga-neon-purple" />
                                        </div>
                                    }
                                    onRenderSuccess={() => {
                                        // Track visible page for continuous mode
                                        if (viewMode === 'continuous') {
                                            const observer = new IntersectionObserver(
                                                (entries) => {
                                                    entries.forEach((entry) => {
                                                        if (entry.isIntersecting) {
                                                            setCurrentPage(index + 1);
                                                        }
                                                    });
                                                },
                                                { threshold: 0.5 }
                                            );
                                            const pageEl = document.getElementById(`page-${index + 1}`);
                                            if (pageEl) observer.observe(pageEl);
                                        }
                                    }}
                                />
                            </div>
                        ))
                    )}
                </Document>
            </div>

            {/* Quick Page Jump - Mobile */}
            <div className="sm:hidden sticky bottom-0 backdrop-blur-xl bg-manga-glass/90 border-t border-manga-neon-purple/20 p-3">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Page</span>
                    <Slider
                        value={[currentPage]}
                        onValueChange={(val) => goToPage(val[0])}
                        min={1}
                        max={numPages || 1}
                        step={1}
                        className="flex-1"
                    />
                    <span className="text-xs font-medium text-foreground w-14 text-right">
                        {currentPage} / {numPages}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PdfViewer;
