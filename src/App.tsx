
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

// Import pages
import Home from "./pages/Home";
import AnimeList from "./pages/AnimeList";
import AnimeDetails from "./pages/AnimeDetails";
import Episodes from "./pages/Episodes";
import Search from "./pages/Search";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import AnimeWatch from "./pages/AnimeWatch";
import AudioSettings from "./pages/AudioSettings";

// Import admin pages  
import AdminDashboard from "./pages/Admin";
import AdminAnime from "./pages/AdminAnime";
import AdminEpisodes from "./pages/AdminEpisodes";
import AdminUsers from "./pages/AdminUsers";
import AdminGenres from "./pages/AdminGenres";

// Create Query Client for API requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
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

                <Routes>
                  {/* Main Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/anime" element={<AnimeList />} />
                  <Route path="/anime/:id" element={<AnimeDetails />} />
                  <Route path="/anime/:id/watch" element={<AnimeWatch />} />
                  <Route path="/episodes" element={<Episodes />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/audio-settings" element={<AudioSettings />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/anime" element={<AdminAnime />} />
                  <Route path="/admin/episodes" element={<AdminEpisodes />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/genres" element={<AdminGenres />} />

                  {/* Catch-all Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
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
