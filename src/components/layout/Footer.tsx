import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { SITE_NAME, ROUTES } from "@/utils/constants";
import { useAudio } from "@/contexts/AudioContext";

export function Footer() {
  const { playButtonClick } = useAudio();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background py-8 md:py-12">
      <div className="container flex flex-col items-center justify-center gap-4 md:gap-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:grid-cols-5">
          <div className="flex flex-col items-start gap-2 md:col-span-2">
            <Link to={ROUTES.home} onClick={playButtonClick} className="text-xl font-heading font-bold bg-gradient-to-r from-primary to-anime-secondary bg-clip-text text-transparent">
              {SITE_NAME}
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your ultimate destination for anime streaming, news, and community.
              Discover your next favorite series with us.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Link to="#" onClick={playButtonClick} className="rounded-full bg-accent/10 p-2 text-accent hover:bg-accent/20">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link to="#" onClick={playButtonClick} className="rounded-full bg-accent/10 p-2 text-accent hover:bg-accent/20">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link to="#" onClick={playButtonClick} className="rounded-full bg-accent/10 p-2 text-accent hover:bg-accent/20">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link to="#" onClick={playButtonClick} className="rounded-full bg-accent/10 p-2 text-accent hover:bg-accent/20">
                <Youtube className="h-4 w-4" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Explore</h3>
            <Link to="/anime" onClick={playButtonClick} className="text-sm text-muted-foreground hover:text-foreground">Anime List</Link>
            <Link to="/episodes" onClick={playButtonClick} className="text-sm text-muted-foreground hover:text-foreground">Latest Episodes</Link>
            <Link to="/genres" onClick={playButtonClick} className="text-sm text-muted-foreground hover:text-foreground">Genres</Link>
            <Link to="/seasonal" onClick={playButtonClick} className="text-sm text-muted-foreground hover:text-foreground">Seasonal</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">About</h3>
            <Link to="/about" onClick={playButtonClick} className="text-sm text-muted-foreground hover:text-foreground">About Us</Link>
            <Link to="/faq" onClick={playButtonClick} className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
            <Link to="/contact" onClick={playButtonClick} className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
            <Link to="/dmca" onClick={playButtonClick} className="text-sm text-muted-foreground hover:text-foreground">DMCA</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Legal</h3>
            <Link to="/privacy" onClick={playButtonClick} className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link to="/terms" onClick={playButtonClick} className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
            <Link to="/copyright" onClick={playButtonClick} className="text-sm text-muted-foreground hover:text-foreground">Copyright</Link>
          </div>
        </div>

        <div className="w-full border-t border-border mt-4 pt-6 flex flex-col md:flex-row justify-between items-center text-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-2 md:mt-0">
            This site is not affiliated with or endorsed by any anime studios or publishers.
          </p>
        </div>
      </div>
    </footer>
  );
}
