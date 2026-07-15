import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Calendar, User, BookOpen, Clock, Loader2, ArrowRight } from "lucide-react";
import { getBlogs, BlogPost, resolveImageUrl, getFitFromUrl } from "@/services/blogService";
import { genreService, Genre } from "@/services/genreService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const getGenreStyles = (name: string, isActive: boolean) => {
  const normalized = name.toLowerCase();
  let gradient = "";
  let icon = "🏷️";

  if (normalized === "news") {
    icon = "📰";
    gradient = "bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-400/20 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]";
  } else if (normalized.includes("review")) {
    icon = "⭐";
    gradient = "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]";
  } else if (normalized.includes("discussion") || normalized.includes("talk")) {
    icon = "💬";
    gradient = "bg-gradient-to-r from-purple-600 to-pink-500 border-purple-400/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]";
  } else if (normalized.includes("manga")) {
    icon = "📖";
    gradient = "bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-400/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]";
  } else if (normalized.includes("anime") || normalized.includes("show")) {
    icon = "🎬";
    gradient = "bg-gradient-to-r from-rose-600 to-red-500 border-rose-400/20 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]";
  } else if (normalized.includes("theory") || normalized.includes("analysis")) {
    icon = "💡";
    gradient = "bg-gradient-to-r from-indigo-600 to-violet-500 border-indigo-400/20 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]";
  } else if (normalized.includes("ranking") || normalized.includes("list") || normalized.includes("top")) {
    icon = "🏆";
    gradient = "bg-gradient-to-r from-yellow-500 to-amber-600 border-yellow-400/20 text-white shadow-[0_0_15px_rgba(234,179,8,0.3)]";
  } else {
    gradient = "bg-gradient-to-r from-primary to-accent border-primary/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]";
  }

  return { gradient, icon };
};

export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await genreService.getAllGenres();
        if (response.success) {
          setGenres(response.data);
        }
      } catch (e) {
        console.error("Failed to load genres", e);
      }
    };
    fetchGenres();
  }, []);

  // Fetch blogs
  useEffect(() => {
    // Set loading state immediately to avoid showing stale data during debounce/fetch
    setLoading(true);

    const fetchBlogData = async () => {
      try {
        const data = await getBlogs({
          page: currentPage,
          limit: 6,
          search: searchQuery || undefined,
          genre: selectedGenre === "All" ? undefined : selectedGenre
        });
        setBlogs(data.blogs);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
      fetchBlogData();
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [currentPage, searchQuery, selectedGenre]);

  // Reading time estimation helper
  const getReadingTime = (content: string | undefined): string => {
    if (!content) return "2 min read";
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.max(Math.ceil(words / 200), 1);
    return `${minutes} min read`;
  };

  return (
    <Layout>
      <SEO
        title="Anime Blogs, News & Reviews | OtakuTV"
        description="Read the latest anime & manga reviews, character analysis, season guides, and editorials. High-quality articles curated for otaku community by OtakuTV editors."
        keywords="anime blogs, manga reviews, anime recommendations, otaku articles, anime news, watch anime online, OtakuTV editorials, anime analysis, my anime list reviews"
        url="/blogs"
      />
      <BreadcrumbSchema 
        items={[
          { name: "Home", url: "https://otakutv.in" },
          { name: "Blogs", url: "https://otakutv.in/blogs" }
        ]}
      />

      {/* Inject custom scrollbar and hover effects */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          height: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.2);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.4);
        }
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(168, 85, 247, 0.15) rgba(255, 255, 255, 0.01);
        }
        .text-glow:hover {
          text-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
        }
      `}</style>

      <div className="min-h-screen bg-[#060608] text-foreground relative overflow-hidden py-8 sm:py-12">
        {/* Glow gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/8 rounded-full blur-[130px] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-accent/4 rounded-full blur-[140px] animate-pulse-slow pointer-events-none" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-purple-950/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-white/[0.012] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-[1400px] space-y-12 relative z-10">
            
            {/* Header Hero Section - Redesigned to be compact & flex-row layout */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0c0e]/95 to-[#13131c]/40 backdrop-blur-xl border border-white/5 p-6 md:p-10 shadow-2xl transition-all duration-300 hover:border-white/10">
              <div className="absolute inset-0 bg-grid-white/[0.015] pointer-events-none" />
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3.5 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-semibold tracking-wider uppercase animate-pulse-slow">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    ⚡ OtakuTV Editorial
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-transparent">
                    Anime News, Reviews & Editorials
                  </h1>
                  <p className="text-muted-foreground text-xs md:text-sm max-w-lg leading-relaxed">
                    Discover deep dives, rankings, reviews, and opinion pieces on your favorite anime shows, movies, and manga series.
                  </p>
                </div>
                {/* Search & Stats Card Section */}
                <div className="relative w-full md:w-80 p-5 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/5 shadow-xl space-y-4 shrink-0 hover:border-primary/30 transition-all duration-300 group">
                  {/* Subtle corner glow */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />
                  
                  <div className="space-y-1 relative z-10">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Find Articles</span>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                      <Input
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-9 pr-4 py-3 bg-background/40 border-white/10 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all duration-300 rounded-xl text-foreground placeholder:text-muted-foreground/45 text-xs h-9.5"
                      />
                    </div>
                  </div>
                  
                  {/* Additional details: Trending topics & stats badges */}
                  <div className="pt-2.5 border-t border-white/5 space-y-2.5 relative z-10">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Platform
                      </span>
                      <span>Updated Daily</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5 text-center">
                        <span className="block font-black text-white text-xs">8</span>
                        <span className="text-muted-foreground text-[8px] uppercase tracking-wide">Editorials</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5 text-center">
                        <span className="block font-black text-primary text-xs">15k+</span>
                        <span className="text-muted-foreground text-[8px] uppercase tracking-wide">Monthly Readers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Genre Filters Scrollable tabs - Redesigned to be smaller & compact */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold tracking-wider uppercase flex items-center gap-2 text-foreground/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Explore Topics
                </h2>
                <span className="text-[10px] text-muted-foreground hidden sm:inline-block">Swipe to explore →</span>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 custom-scroll mask-image">
                <button
                  onClick={() => {
                    setSelectedGenre("All");
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 py-2 px-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] shrink-0 ${
                    selectedGenre === "All"
                      ? "bg-gradient-to-r from-primary via-purple-600 to-accent border-primary/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "bg-[#121216]/60 backdrop-blur-md hover:bg-[#16161f]/85 border-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-sm bg-white/5 w-6 h-6 rounded-lg flex items-center justify-center border border-white/5">🌐</span>
                  <span className="text-xs font-semibold">All Stories</span>
                </button>
                {genres.map((genre) => {
                  const isActive = selectedGenre === genre.name;
                  const styles = getGenreStyles(genre.name, isActive);
                  return (
                    <button
                      key={genre.id}
                      onClick={() => {
                        setSelectedGenre(genre.name);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 py-2 px-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] shrink-0 ${
                        isActive
                          ? styles.gradient
                          : "bg-[#121216]/60 backdrop-blur-md hover:bg-[#16161f]/85 border-white/5 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-sm bg-white/5 w-6 h-6 rounded-lg flex items-center justify-center border border-white/5">{styles.icon}</span>
                      <span className="text-xs font-semibold">{genre.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Article - Hidden when loading */}
            {!loading && currentPage === 1 && !searchQuery && selectedGenre === "All" && blogs.length > 0 && (
              <div 
                onClick={() => navigate(`/blogs/${blogs[0].slug}`)}
                className="group relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#121217]/90 to-[#181824]/30 backdrop-blur-lg shadow-2xl hover:shadow-primary/5 cursor-pointer transition-all duration-500 hover:border-primary/45 flex flex-col lg:flex-row gap-6 p-6"
              >
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-80 pointer-events-none transition-opacity duration-500" />
                
                {/* Image side */}
                <div className="w-full lg:w-3/5 aspect-video lg:aspect-auto lg:h-[320px] rounded-2xl overflow-hidden bg-muted relative">
                  <img
                    src={resolveImageUrl(blogs[0].coverImage)}
                    alt={blogs[0].title}
                    className={`w-full h-full object-${getFitFromUrl(blogs[0].coverImage)} group-hover:scale-[1.02] transition-transform duration-700 ease-out`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-65" />
                  <Badge className="absolute top-4 left-4 bg-primary/95 text-white backdrop-blur-sm py-1 px-3 border border-white/10 shadow-lg font-bold tracking-wide uppercase text-[9px] animate-pulse-slow">
                    ★ Featured Article
                  </Badge>
                </div>

                {/* Content side */}
                <div className="w-full lg:w-2/5 flex flex-col justify-between py-1 relative z-10">
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1 bg-white/5 py-1 px-2 rounded-full border border-white/5">
                        <Calendar className="h-3 w-3 text-primary" />
                        {new Date(blogs[0].createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                      <span className="flex items-center gap-1 bg-white/5 py-1 px-2 rounded-full border border-white/5">
                        <Clock className="h-3 w-3 text-primary" />
                        {getReadingTime(blogs[0].content)}
                      </span>
                      <span className="flex items-center gap-1 bg-white/5 py-1 px-2 rounded-full border border-white/5">
                        <Eye className="h-3 w-3 text-primary" />
                        {blogs[0].views} Views
                      </span>
                    </div>

                    <h2 className="text-xl lg:text-2xl font-black leading-tight tracking-tight text-white group-hover:text-primary transition-colors duration-300">
                      {blogs[0].title}
                    </h2>

                    <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed line-clamp-4 lg:line-clamp-5">
                      {blogs[0].summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 lg:mt-0">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {blogs[0].author?.displayName?.substring(0, 2).toUpperCase() || "AD"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">
                          {blogs[0].author?.displayName || "Admin"}
                        </span>
                        <span className="text-[9px] text-muted-foreground">Author</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-primary font-bold text-xs bg-primary/10 hover:bg-primary/25 transition-all py-2 px-3 rounded-lg group-hover:translate-x-1 duration-300">
                      Read Full Article
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blogs Section Header */}
            {!loading && currentPage === 1 && !searchQuery && selectedGenre === "All" && blogs.length > 1 && (
              <div className="pt-2">
                <h2 className="text-lg font-black tracking-tight text-white/90">
                  Latest Stories
                </h2>
              </div>
            )}

            {/* Blogs Grid - Redesigned to 4 columns, smaller padding and font sizes */}
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden border border-white/5 bg-[#121216]/50 rounded-2xl h-[330px] flex flex-col justify-between p-4 animate-pulse">
                    <div className="aspect-video bg-white/5 rounded-xl" />
                    <div className="space-y-3 py-3 flex-1">
                      <div className="h-3 w-1/4 bg-white/5 rounded" />
                      <div className="h-4 w-full bg-white/5 rounded" />
                      <div className="h-3.5 w-5/6 bg-white/5 rounded" />
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-auto">
                      <div className="h-6 w-16 bg-white/5 rounded-md" />
                      <div className="h-3.5 w-10 bg-white/5 rounded" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl bg-[#111116]/40 backdrop-blur-md">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
                <h3 className="text-lg font-bold text-foreground">No articles found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-1 text-xs leading-relaxed">
                  We couldn't find any articles matching "{searchQuery}" under {selectedGenre}. Try resetting filters or searching for something else.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
                {(() => {
                  const featuredBlog = currentPage === 1 && !searchQuery && selectedGenre === "All" && blogs.length > 0 ? blogs[0] : null;
                  const gridBlogs = featuredBlog ? blogs.slice(1) : blogs;
                  
                  return gridBlogs.map((blog) => (
                    <Card
                      key={blog.id}
                      onClick={() => navigate(`/blogs/${blog.slug}`)}
                      className="group relative overflow-hidden border border-white/5 bg-gradient-to-br from-[#121217]/90 via-[#16161f]/75 to-[#1c1c24]/50 hover:border-primary/45 transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] cursor-pointer rounded-2xl flex flex-col h-full overflow-hidden p-4"
                    >
                      {/* Top line indicator glow */}
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                      
                      {/* Image cover */}
                      <div className="aspect-video relative overflow-hidden bg-muted rounded-xl">
                        <img
                          src={resolveImageUrl(blog.coverImage)}
                          alt={blog.title}
                          className={`w-full h-full object-${getFitFromUrl(blog.coverImage)} group-hover:scale-105 transition-transform duration-700 ease-out`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-85" />
                        
                        {/* Tags */}
                        {blog.genres && blog.genres.length > 0 && (
                          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            {blog.genres.slice(0, 2).map((g) => (
                              <Badge key={g.id} className="bg-background/90 text-foreground backdrop-blur-sm border border-white/5 text-[8px] font-semibold py-0.5 px-2 rounded uppercase">
                                {g.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Content details */}
                      <div className="pt-4 flex flex-col flex-1">
                        <div className="flex items-center gap-2.5 text-[9px] text-muted-foreground mb-2 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-primary" />
                            {new Date(blog.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" />
                            {getReadingTime(blog.content)}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-sm leading-snug line-clamp-2 text-white group-hover:text-primary transition-colors duration-200 mb-1.5">
                          {blog.title}
                        </h3>
                        
                        <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                          {blog.summary}
                        </p>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                          <div className="flex items-center gap-1.5">
                            <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-[9px] uppercase">
                              {blog.author?.displayName?.substring(0, 2) || "AD"}
                            </div>
                            <span className="truncate max-w-[70px] text-[10px] font-semibold text-white">
                              {blog.author?.displayName || "Admin"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Eye className="h-3 w-3" />
                              {blog.views}
                            </span>
                            <span className="text-primary font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform duration-200">
                              Read <ArrowRight className="h-3 w-3 animate-pulse-slow" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ));
                })()}
              </div>
            )}

            {/* Pagination */}
            {totalPages >= 1 && (
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="px-2.5 sm:px-3 text-xs h-8 sm:h-9 bg-[#121216]/60 hover:bg-white/5 border-white/10"
                >
                  Previous
                </Button>
                {(() => {
                  const pages: (number | string)[] = [];
                  const range = 1;
                  for (let i = 1; i <= totalPages; i++) {
                    if (
                      i === 1 ||
                      i === totalPages ||
                      (i >= currentPage - range && i <= currentPage + range)
                    ) {
                      pages.push(i);
                    } else if (pages[pages.length - 1] !== "...") {
                      pages.push("...");
                    }
                  }
                  return pages.map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="text-muted-foreground px-1 sm:px-2 text-xs">
                          ...
                        </span>
                      );
                    }
                    return (
                      <Button
                        key={`page-${p}`}
                        variant={currentPage === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCurrentPage(p as number);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-8 h-8 sm:w-9 sm:h-9 p-0 text-xs font-semibold rounded-md transition-all ${
                          currentPage === p 
                            ? "bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white shadow-md shadow-primary/20 scale-105 border-none animate-pulse-slow" 
                            : "bg-[#121216]/60 hover:bg-white/5 border-white/10"
                        }`}
                      >
                        {p}
                      </Button>
                    );
                  });
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-2.5 sm:px-3 text-xs h-8 sm:h-9 bg-[#121216]/60 hover:bg-white/5 border-white/10"
                >
                  Next
                </Button>
              </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
