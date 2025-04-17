import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import pages
import Home from "./pages/Home";
import AnimeList from "./pages/AnimeList";
import AnimeDetails from "./pages/AnimeDetails";
import Episodes from "./pages/Episodes";
import Search from "./pages/Search";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/anime" element={<AnimeList />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/episodes" element={<Episodes />} />
          <Route path="/search" element={<Search />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
