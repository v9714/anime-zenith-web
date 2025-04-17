
import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { EpisodeForm } from "@/components/admin/EpisodeForm";

interface Episode {
  id: number;
  animeId: number;
  animeTitle: string;
  episodeNumber: number;
  title: string;
  thumbnailUrl: string;
  duration: number;
  airedDate: string;
}

const AdminEpisodes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Mock data - in a real app this would come from your API
  const [episodes, setEpisodes] = useState<Episode[]>([
    {
      id: 1,
      animeId: 1,
      animeTitle: "Fullmetal Alchemist: Brotherhood",
      episodeNumber: 1,
      title: "Fullmetal Alchemist",
      thumbnailUrl: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
      duration: 24,
      airedDate: "2009-04-05"
    },
    {
      id: 2,
      animeId: 1,
      animeTitle: "Fullmetal Alchemist: Brotherhood",
      episodeNumber: 2,
      title: "The First Day",
      thumbnailUrl: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
      duration: 24,
      airedDate: "2009-04-12"
    }
  ]);

  const filteredEpisodes = episodes.filter(episode => 
    episode.animeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    episode.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEpisode = (episode: Episode) => {
    setEpisodes([...episodes, episode]);
    setDialogOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Episode Management</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Episode
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Episode</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new episode to the database.
                </DialogDescription>
              </DialogHeader>
              <EpisodeForm onSubmit={handleAddEpisode} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search episodes..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Anime</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Episode</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Duration</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Aired Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEpisodes.map((episode) => (
                  <tr 
                    key={episode.id} 
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Film className="h-5 w-5 text-muted-foreground" />
                        <span>{episode.animeTitle}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{episode.episodeNumber}</td>
                    <td className="p-4 align-middle">{episode.title}</td>
                    <td className="p-4 align-middle">{episode.duration} min</td>
                    <td className="p-4 align-middle">{episode.airedDate}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button size="icon" variant="ghost">
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

export default AdminEpisodes;
