import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Slider } from '@/components/ui/slider';
import {
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    pdfUrl: string;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    overlayClass?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
    pdfUrl,
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

    const pageWidth = Math.min(containerWidth * (zoom / 100), containerWidth);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col min-h-full ${overlayClass}`}>
            {/* PDF Content */}
            <div className="flex-1 p-4 pb-24 flex justify-center">
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

        </div>
    );
};

export default PdfViewer;
