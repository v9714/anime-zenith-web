
import React, { useEffect, useState } from "react";
import { mangaService, Manga } from "@/services/mangaService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MANGA_API_URL } from "@/utils/constants";
import { Search, Loader2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";

const MangaList = () => {
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    return (
        <div className="min-h-screen bg-background text-foreground pb-12">
            {/* Hero Section */}
            <div className="relative h-[300px] w-full bg-gradient-to-r from-purple-900/40 to-blue-900/40 flex items-center justify-center mb-8 border-b border-white/5">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        Explore Manga
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Dive into thousands of stories. Read your favorite manga chapters with seamless progress tracking.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Search Bar */}
                <div className="relative max-w-xl mx-auto mb-12">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                        placeholder="Search manga by title or author..."
                        className="pl-10 h-12 bg-white/5 border-white/10 focus:border-purple-500/50 transition-all rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                        <p className="text-muted-foreground animate-pulse">Loading manga universe...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredManga.map((manga) => (
                            <Link key={manga.id} to={`/manga/${manga.id}`} className="group">
                                <Card className="overflow-hidden border-none bg-transparent hover:scale-105 transition-all duration-300">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-xl">
                                        <img
                                            src={getImageUrl(manga.coverImage)}
                                            alt={manga.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <div className="flex items-center gap-2 text-white text-xs font-medium">
                                                <BookOpen className="w-4 h-4" />
                                                Read Now
                                            </div>
                                        </div>
                                        {manga.status && (
                                            <Badge className="absolute top-2 right-2 bg-purple-600/90 hover:bg-purple-600 text-[10px] px-2 py-0.5">
                                                {manga.status}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardContent className="p-3">
                                        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-purple-400 transition-colors">
                                            {manga.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                            {manga.author || "Unknown Author"}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && filteredManga.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg">No manga found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MangaList;
