import React, { useEffect, useState } from "react";
import { mangaService, Manga } from "@/services/mangaService";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MANGA_API_URL } from "@/utils/constants";
import { Search, Loader2, BookOpen, Sparkles, TrendingUp, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

const MangaList = () => {
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    useEffect(() => {
        const fetchManga = async () => {
            try {
                const response = await mangaService.getAllManga();
                if (response.success) {
                    setMangas(response.data);
                }
            } catch (error) {
                console.error("Error fetching manga:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchManga();
    }, []);

    const filteredManga = mangas.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getImageUrl = (path: string | null) => {
        if (!path) return "/placeholder-manga.jpg";
        if (path.startsWith('http')) return path;
        return `${MANGA_API_URL}/${path.replace(/\\/g, '/')}`;
    };

    const getStatusGradient = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'ongoing':
                return 'from-manga-neon-purple to-manga-neon-pink';
            case 'completed':
                return 'from-manga-neon-cyan to-manga-accent';
            default:
                return 'from-manga-primary to-manga-secondary';
        }
    };

    return (
        <div className="min-h-screen bg-manga-dark text-foreground pb-12">
            {/* Cyberpunk Hero Section */}
            <div className="relative h-[350px] w-full overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-manga-dark via-manga-glass to-manga-dark" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-manga-primary/20 via-transparent to-transparent" />
                
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-20" 
                    style={{
                        backgroundImage: `linear-gradient(hsl(var(--manga-neon-purple) / 0.3) 1px, transparent 1px),
                                         linear-gradient(90deg, hsl(var(--manga-neon-purple) / 0.3) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} 
                />
                
                {/* Floating Orbs */}
                <div className="absolute top-20 left-1/4 w-64 h-64 bg-manga-neon-purple/30 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-manga-neon-pink/20 rounded-full blur-[80px] animate-float" style={{ animationDelay: '1s' }} />
                
                <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-manga-neon-pink animate-neon-flicker" />
                        <span className="text-manga-neon-pink text-sm font-medium tracking-widest uppercase">Premium Collection</span>
                        <Sparkles className="w-6 h-6 text-manga-neon-pink animate-neon-flicker" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 text-center">
                        <span className="bg-gradient-to-r from-manga-neon-purple via-manga-neon-pink to-manga-neon-cyan bg-clip-text text-transparent animate-neon-flicker">
                            Manga Universe
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-center mb-8">
                        Immerse yourself in stunning stories. Premium reading experience awaits.
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-8 text-sm">
                        <div className="flex items-center gap-2 text-manga-neon-purple">
                            <BookOpen className="w-4 h-4" />
                            <span>{mangas.length} Titles</span>
                        </div>
                        <div className="flex items-center gap-2 text-manga-neon-pink">
                            <TrendingUp className="w-4 h-4" />
                            <span>Updated Daily</span>
                        </div>
                        <div className="flex items-center gap-2 text-manga-neon-cyan">
                            <Clock className="w-4 h-4" />
                            <span>Latest Chapters</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-20">
                {/* Glassmorphism Search Bar */}
                <div className="relative max-w-2xl mx-auto mb-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-manga-neon-purple/20 to-manga-neon-pink/20 rounded-2xl blur-xl" />
                    <div className="relative backdrop-blur-xl bg-manga-glass/50 border border-manga-neon-purple/20 rounded-2xl p-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-manga-neon-purple w-5 h-5" />
                            <Input
                                placeholder="Search manga by title or author..."
                                className="pl-12 h-14 bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground text-lg rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-manga-neon-purple/30 rounded-full" />
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-manga-neon-pink rounded-full animate-spin" />
                        </div>
                        <p className="text-muted-foreground mt-6 animate-pulse">Loading manga universe...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredManga.map((manga, index) => (
                            <Link 
                                key={manga.id} 
                                to={`/manga/${manga.id}`} 
                                className="group"
                                onMouseEnter={() => setHoveredId(manga.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Glassmorphism Card */}
                                <div className={`
                                    relative overflow-hidden rounded-2xl
                                    transition-all duration-500 ease-out
                                    ${hoveredId === manga.id ? 'scale-105 z-10' : 'scale-100'}
                                `}>
                                    {/* Glowing Border Effect */}
                                    <div className={`
                                        absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100
                                        bg-gradient-to-r from-manga-neon-purple via-manga-neon-pink to-manga-neon-cyan
                                        transition-opacity duration-300 blur-sm
                                    `} />
                                    
                                    {/* Card Content */}
                                    <div className="relative backdrop-blur-sm bg-manga-glass/60 rounded-2xl overflow-hidden border border-manga-neon-purple/10 group-hover:border-transparent">
                                        {/* Cover Image */}
                                        <div className="relative aspect-[3/4] overflow-hidden">
                                            <img
                                                src={getImageUrl(manga.coverImage)}
                                                alt={manga.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            
                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-manga-dark via-manga-dark/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                            
                                            {/* Hover Read Button */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="px-4 py-2 bg-manga-neon-purple/90 backdrop-blur-sm rounded-full flex items-center gap-2 text-white font-medium shadow-lg shadow-manga-neon-purple/30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    <BookOpen className="w-4 h-4" />
                                                    Read Now
                                                </div>
                                            </div>
                                            
                                            {/* Status Badge */}
                                            {manga.status && (
                                                <Badge className={`
                                                    absolute top-3 right-3 
                                                    bg-gradient-to-r ${getStatusGradient(manga.status)}
                                                    text-white text-[10px] font-bold px-2.5 py-1 
                                                    border-none shadow-lg animate-glow-pulse
                                                `}>
                                                    {manga.status}
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        {/* Card Info */}
                                        <div className="p-4 bg-gradient-to-t from-manga-dark to-manga-glass/80">
                                            <h3 className="font-bold text-sm line-clamp-1 text-foreground group-hover:text-manga-neon-pink transition-colors duration-300">
                                                {manga.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-manga-neon-purple" />
                                                {manga.author || "Unknown Author"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && filteredManga.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-manga-glass border border-manga-neon-purple/20 mb-6">
                            <Search className="w-8 h-8 text-manga-neon-purple" />
                        </div>
                        <p className="text-muted-foreground text-lg">No manga found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MangaList;
