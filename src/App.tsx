
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioProvider } from "@/contexts/AudioContext";

import { QUERY_CONFIG } from "@/utils/constants";

// Manga pages (MangaDex API)
import MangaHome from "./pages/MangaHome";
import MangaBrowse from "./pages/MangaBrowse";
import MangaDetailsPage from "./pages/MangaDetailsNew";
import MangaReaderNew from "./pages/MangaReaderNew";

// Utility pages
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import Contact from "./pages/Contact";
import UserProfile from "./pages/UserProfile";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

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
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <AudioProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />

                <React.Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Main Manga Routes */}
                    <Route path="/" element={<MangaHome />} />
                    <Route path="/browse" element={<MangaBrowse />} />
                    <Route path="/manga/:id" element={<MangaDetailsPage />} />
                    <Route path="/read/:mangaId/chapter/:chapterId" element={<MangaReaderNew />} />
                    
                    {/* Utility Routes */}
                    <Route path="/search" element={<Search />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />

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
  );
};

export default App;
