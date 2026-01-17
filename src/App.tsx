import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioProvider } from "@/contexts/AudioContext";

import { DevelopmentNotice } from "@/components/DevelopmentNotice";
import { QUERY_CONFIG } from "@/utils/constants";

// Import main pages directly for faster initial load
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import AnimeDetails from "./pages/AnimeDetails";
import AnimeWatch from "./pages/AnimeWatch";

// other pages
import AnimeList from "./pages/AnimeList";
import Episodes from "./pages/Episodes";
import Search from "./pages/Search";
import Contact from "./pages/Contact";
import UserProfile from "./pages/UserProfile";
import AudioSettings from "./pages/AudioSettings";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

// admin pages
import AdminDashboard from "./pages/Admin";
import AdminAnime from "./pages/AdminAnime";
import AdminEpisodes from "./pages/AdminEpisodes";
import AdminUsers from "./pages/AdminUsers";
import AdminGenres from "./pages/AdminGenres";
import AdminOptions from "./pages/AdminOptions";
import AdminLogs from "./pages/AdminLogs";

// manga pages
import MangaHome from "./pages/MangaHome";
import MangaList from "./pages/MangaList";
import MangaDetails from "./pages/MangaDetails";
import MangaReader from "./pages/MangaReader";
import AdminManga from "./pages/AdminManga";
import AdminChapters from "./pages/AdminChapters";

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Simple Error Boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">The application encountered a critical error. Please refresh the page.</p>
          <pre className="p-4 bg-muted rounded-md text-xs max-w-full overflow-auto mb-4">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create Query Client for API requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      retry: QUERY_CONFIG.RETRY_COUNT,
      staleTime: QUERY_CONFIG.STALE_TIME,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark">
            <AuthProvider>
              <AudioProvider>
                <TooltipProvider>
                  {/* Toaster components */}
                  <Toaster />
                  <Sonner />
                  <DevelopmentNotice />

                  <React.Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Main Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/anime" element={<AnimeList />} />
                      <Route path="/anime/:id" element={<AnimeDetails />} />
                      <Route path="/watch/:encoded" element={<AnimeWatch />} />
                      <Route path="/episodes" element={<Episodes />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/audio-settings" element={<AudioSettings />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/verify-email" element={<VerifyEmail />} />

                      {/* Manga Routes */}
                      <Route path="/manga" element={<MangaHome />} />
                      <Route path="/manga/browse" element={<MangaList />} />
                      <Route path="/browse" element={<MangaList />} />
                      <Route path="/manga/:id" element={<MangaDetails />} />
                      <Route path="/read/:mangaId/chapter/:chapterId" element={<MangaReader />} />

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/anime" element={<AdminAnime />} />
                      <Route path="/admin/episodes" element={<AdminEpisodes />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/genres" element={<AdminGenres />} />
                      <Route path="/admin/options" element={<AdminOptions />} />
                      <Route path="/admin/logs" element={<AdminLogs />} />
                      <Route path="/admin/manga" element={<AdminManga />} />
                      <Route path="/admin/manga/:mangaId/chapters" element={<AdminChapters />} />

                      {/* Catch-all Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </React.Suspense>
                </TooltipProvider>
              </AudioProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
