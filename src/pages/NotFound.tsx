import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="container py-16 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-anime-secondary to-anime-accent bg-clip-text text-transparent animate-pulse-slow">404</h1>
          <h2 className="text-2xl font-heading font-bold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            Oops! The page you're looking for doesn't exist or has been moved to another URL.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Return Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link to="/search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Anime
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
