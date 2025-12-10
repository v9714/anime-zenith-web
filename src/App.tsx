
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DevelopmentNotice } from "@/components/DevelopmentNotice";
import { QUERY_CONFIG } from "@/utils/constants";

// Import main pages directly for faster initial load
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import AnimeDetails from "./pages/AnimeDetails";
import AnimeWatch from "./pages/AnimeWatch";

// Lazy load other pages for better code splitting
const AnimeList = React.lazy(() => import("./pages/AnimeList"));
const Episodes = React.lazy(() => import("./pages/Episodes"));
const Search = React.lazy(() => import("./pages/Search"));
const Contact = React.lazy(() => import("./pages/Contact"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const AudioSettings = React.lazy(() => import("./pages/AudioSettings"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));

// Lazy load admin pages - only loaded when needed
const AdminDashboard = React.lazy(() => import("./pages/Admin"));
const AdminAnime = React.lazy(() => import("./pages/AdminAnime"));
const AdminEpisodes = React.lazy(() => import("./pages/AdminEpisodes"));
const AdminUsers = React.lazy(() => import("./pages/AdminUsers"));
const AdminGenres = React.lazy(() => import("./pages/AdminGenres"));
const AdminOptions = React.lazy(() => import("./pages/AdminOptions"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
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

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/anime" element={<AdminAnime />} />
                      <Route path="/admin/episodes" element={<AdminEpisodes />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/genres" element={<AdminGenres />} />
                      <Route path="/admin/options" element={<AdminOptions />} />

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
