
import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { AnimeForm } from "@/components/admin/AnimeForm";
import { Anime } from "@/services/api";

const AdminAnime = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Mock data - in a real app this would come from your API
  const [animes, setAnimes] = useState<Anime[]>([
    {
      mal_id: 1,
      title: "Fullmetal Alchemist: Brotherhood",
      title_english: "Fullmetal Alchemist: Brotherhood",
      title_japanese: "鋼の錬金術師 FULLMETAL ALCHEMIST",
      images: {
        jpg: {
          image_url: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
          small_image_url: "https://cdn.myanimelist.net/images/anime/1223/96541t.jpg",
          large_image_url: "https://cdn.myanimelist.net/images/anime/1223/96541l.jpg"
        },
        webp: {
          image_url: "https://cdn.myanimelist.net/images/anime/1223/96541.webp",
          small_image_url: "https://cdn.myanimelist.net/images/anime/1223/96541t.webp",
          large_image_url: "https://cdn.myanimelist.net/images/anime/1223/96541l.webp"
        }
      },
      type: "TV",
      episodes: 64,
      status: "Finished Airing",
      airing: false,
      synopsis: "After a terrible alchemy experiment gone wrong...",
      score: 9.11,
      genres: [
        { mal_id: 1, name: "Action" },
        { mal_id: 2, name: "Adventure" },
        { mal_id: 8, name: "Drama" }
      ],
      rating: "R - 17+ (violence & profanity)",
      aired: {
        from: "2009-04-05T00:00:00+00:00",
        to: "2010-07-04T00:00:00+00:00"
      },
      season: "spring",
      year: 2009,
      duration: "24 min per ep",
      trailer: {
        youtube_id: "--IcmZkvL0Q",
        url: "https://www.youtube.com/watch?v=--IcmZkvL0Q"
      }
    }
  ]);

  const filteredAnime = animes.filter(anime => 
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAnime = (anime: Anime) => {
    setAnimes([...animes, anime]);
    setDialogOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-anime-primary to-anime-secondary bg-clip-text text-transparent">
            Anime Management
          </h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Anime
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Anime</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new anime to the database.
                </DialogDescription>
              </DialogHeader>
              <AnimeForm onSubmit={handleAddAnime} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anime..."
              className="w-full pl-8 border-secondary/30 focus-visible:ring-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden shadow-sm">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm min-w-[800px]">
              <thead className="border-b bg-muted/50">
                <tr className="border-b">
                  <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium">Title</th>
                  <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium">Type</th>
                  <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium">Episodes</th>
                  <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium">Genres</th>
                  <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnime.map((anime) => (
                  <tr 
                    key={anime.mal_id} 
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <td className="p-2 sm:p-4 align-middle">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img 
                          src={anime.images.webp.small_image_url} 
                          alt={anime.title}
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-md object-cover shadow-sm"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{anime.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{anime.title_japanese}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 align-middle text-sm">{anime.type}</td>
                    <td className="p-2 sm:p-4 align-middle text-sm">{anime.episodes}</td>
                    <td className="p-2 sm:p-4 align-middle">
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        anime.airing 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}>
                        {anime.airing ? "Airing" : "Completed"}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {anime.genres.slice(0, 2).map((genre) => (
                          <span 
                            key={genre.mal_id} 
                            className="inline-block bg-muted/60 px-1.5 py-0.5 text-xs rounded-full"
                          >
                            {genre.name}
                          </span>
                        ))}
                        {anime.genres.length > 2 && (
                          <span className="inline-block bg-muted/60 px-1.5 py-0.5 text-xs rounded-full">
                            +{anime.genres.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 align-middle">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnime;
