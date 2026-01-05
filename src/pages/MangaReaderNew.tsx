import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  Home,
  List,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Sun,
  Moon,
  BookOpen,
  RotateCcw,
  Columns,
  AlignJustify,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMangaDetails, useChapterPages, useMangaChapters } from '@/hooks/useMangaDex';
import { SimpleChapter } from '@/services/mangadexApi';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ReadingMode = 'single' | 'continuous' | 'double';
type Theme = 'light' | 'dark' | 'sepia' | 'midnight';

const themes: Record<Theme, { bg: string; overlay: string }> = {
  light: { bg: 'bg-gray-100', overlay: '' },
  dark: { bg: 'bg-gray-950', overlay: '' },
  sepia: { bg: 'bg-amber-50', overlay: 'sepia' },
  midnight: { bg: 'bg-slate-950', overlay: '' },
};

export default function MangaReaderNew() {
  const { mangaId, chapterId } = useParams<{ mangaId: string; chapterId: string }>();
  const navigate = useNavigate();
  
  // State
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [readingMode, setReadingMode] = useState<ReadingMode>('continuous');
  const [theme, setTheme] = useState<Theme>('dark');
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout>();

  // Data fetching
  const { data: manga } = useMangaDetails(mangaId || '');
  const { data: pagesData, isLoading: loadingPages } = useChapterPages(chapterId || '', dataSaver);
  const { data: chaptersData } = useMangaChapters(mangaId || '', 'en');

  const pages = pagesData || [];
  const chapters = chaptersData?.pages.flatMap(page => page.data).sort((a, b) => {
    const aNum = parseFloat(a.chapter || '0');
    const bNum = parseFloat(b.chapter || '0');
    return aNum - bNum;
  }) || [];

  const currentChapter = chapters.find(c => c.id === chapterId);
  const currentChapterIndex = chapters.findIndex(c => c.id === chapterId);
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  // Controls visibility
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    setShowControls(true);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [resetControlsTimeout]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout();
      
      switch (e.key) {
        case 'ArrowLeft':
          if (readingMode === 'single' && currentPage > 0) {
            setCurrentPage(prev => prev - 1);
          }
          break;
        case 'ArrowRight':
          if (readingMode === 'single' && currentPage < pages.length - 1) {
            setCurrentPage(prev => prev + 1);
          }
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, readingMode, isFullscreen, resetControlsTimeout]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Navigation
  const goToChapter = (chapter: SimpleChapter) => {
    navigate(`/read/${mangaId}/chapter/${chapter.id}`);
    setCurrentPage(0);
  };

  if (loadingPages) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", themes[theme].bg)}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", themes[theme].bg)}>
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">No pages available</h2>
          <p className="text-muted-foreground">This chapter doesn't have any pages</p>
          <Button asChild>
            <Link to={`/manga/${mangaId}`}>Back to Details</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-h-screen relative",
        themes[theme].bg,
        themes[theme].overlay
      )}
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
    >
      {/* Top Bar */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b transition-all duration-300",
          showControls ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/manga/${mangaId}`}>
                <X className="w-5 h-5" />
              </Link>
            </Button>
            <div className="hidden sm:block">
              <h1 className="font-medium truncate max-w-[200px] md:max-w-[400px]">
                {manga?.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Chapter {currentChapter?.chapter || '?'}
                {currentChapter?.title && ` - ${currentChapter.title}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-secondary rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(100)}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Fullscreen */}
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>

            {/* Settings Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Reader Settings</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Reading Mode */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reading Mode</label>
                    <Select value={readingMode} onValueChange={(v) => setReadingMode(v as ReadingMode)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Page</SelectItem>
                        <SelectItem value="continuous">Continuous Scroll</SelectItem>
                        <SelectItem value="double">Double Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Theme */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Theme</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['light', 'dark', 'sepia', 'midnight'] as Theme[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            "p-3 rounded-lg border text-center text-xs capitalize transition-all",
                            theme === t
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zoom */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Zoom: {zoom}%</label>
                    <Slider
                      value={[zoom]}
                      min={50}
                      max={200}
                      step={10}
                      onValueChange={([v]) => setZoom(v)}
                    />
                  </div>

                  {/* Data Saver */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Data Saver</p>
                      <p className="text-xs text-muted-foreground">Load lower quality images</p>
                    </div>
                    <Button
                      variant={dataSaver ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDataSaver(!dataSaver)}
                    >
                      {dataSaver ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Chapter List */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <List className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Chapters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto">
                  {chapters.map(chapter => (
                    <button
                      key={chapter.id}
                      onClick={() => goToChapter(chapter)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-colors",
                        chapter.id === chapterId
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      )}
                    >
                      <div className="font-medium">Chapter {chapter.chapter || '?'}</div>
                      {chapter.title && (
                        <div className="text-sm opacity-70 truncate">{chapter.title}</div>
                      )}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-20">
        {readingMode === 'continuous' ? (
          // Continuous scroll mode
          <div className="flex flex-col items-center gap-2 px-2">
            {pages.map((page, index) => (
              <img
                key={index}
                src={page}
                alt={`Page ${index + 1}`}
                className="max-w-full"
                style={{ width: `${zoom}%`, maxWidth: '100%' }}
                loading="lazy"
              />
            ))}
          </div>
        ) : readingMode === 'single' ? (
          // Single page mode
          <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
            <img
              src={pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className="max-h-[calc(100vh-180px)] object-contain"
              style={{ width: `${zoom}%`, maxWidth: '100%' }}
            />
          </div>
        ) : (
          // Double page mode
          <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4 gap-2">
            {currentPage > 0 && (
              <img
                src={pages[currentPage - 1]}
                alt={`Page ${currentPage}`}
                className="max-h-[calc(100vh-180px)] object-contain"
                style={{ width: `${zoom / 2}%`, maxWidth: '50%' }}
              />
            )}
            <img
              src={pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className="max-h-[calc(100vh-180px)] object-contain"
              style={{ width: `${zoom / 2}%`, maxWidth: '50%' }}
            />
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t transition-all duration-300",
          showControls ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Prev Chapter */}
            <Button
              variant="outline"
              size="sm"
              disabled={!prevChapter}
              onClick={() => prevChapter && goToChapter(prevChapter)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </Button>

            {/* Page Indicator / Slider */}
            <div className="flex-1 flex items-center gap-4">
              {readingMode === 'single' && (
                <>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {currentPage + 1} / {pages.length}
                  </span>
                  <Slider
                    value={[currentPage]}
                    min={0}
                    max={pages.length - 1}
                    step={1}
                    onValueChange={([v]) => setCurrentPage(v)}
                    className="flex-1"
                  />
                </>
              )}
              {readingMode === 'continuous' && (
                <span className="text-sm text-muted-foreground">
                  {pages.length} pages
                </span>
              )}
            </div>

            {/* Next Chapter */}
            <Button
              variant="outline"
              size="sm"
              disabled={!nextChapter}
              onClick={() => nextChapter && goToChapter(nextChapter)}
              className="gap-2"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Side Navigation (Single Page Mode) */}
      {readingMode === 'single' && (
        <>
          <button
            onClick={() => currentPage > 0 && setCurrentPage(prev => prev - 1)}
            className={cn(
              "fixed left-0 top-1/2 -translate-y-1/2 w-1/3 h-1/2 z-40 cursor-pointer",
              currentPage === 0 && "cursor-not-allowed"
            )}
            disabled={currentPage === 0}
          />
          <button
            onClick={() => currentPage < pages.length - 1 && setCurrentPage(prev => prev + 1)}
            className={cn(
              "fixed right-0 top-1/2 -translate-y-1/2 w-1/3 h-1/2 z-40 cursor-pointer",
              currentPage === pages.length - 1 && "cursor-not-allowed"
            )}
            disabled={currentPage === pages.length - 1}
          />
        </>
      )}
    </div>
  );
}
