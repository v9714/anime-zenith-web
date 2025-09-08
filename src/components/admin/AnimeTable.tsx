import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { Anime } from "@/services/api";
import { getImageUrl } from "@/utils/commanFunction";

interface AnimeTableProps {
  animes: Anime[];
  loading: boolean;
  onEdit: (anime: Anime) => void;
  onDelete: (id: string | number) => void;
}

export function AnimeTable({ animes, loading, onEdit, onDelete }: AnimeTableProps) {
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Airing":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Upcoming":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Genres</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded-md animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-6 w-20 bg-muted rounded-full animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-8 w-16 bg-muted rounded animate-pulse" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (animes.length === 0) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Genres</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No anime found matching your criteria.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Genres</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animes.map((anime) => (
            <TableRow key={anime.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <img
                    src={getImageUrl(anime.coverImage)}
                    alt={anime.title}
                    className="h-12 w-12 rounded-md object-cover shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{anime.title}</p>
                    {anime.alternativeTitles
                      ?.filter((title) => title !== anime.title)
                      .slice(0, 1)
                      .map((title, index) => (
                        <p key={index} className="text-sm text-muted-foreground truncate">
                          {title}
                        </p>
                      ))}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{anime.type}</Badge>
              </TableCell>
              <TableCell>{anime.year}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getStatusBadgeStyle(anime.status || "Completed")}
                >
                  {anime.status || "Completed"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {anime.genres?.slice(0, 2).map((genreItem) => (
                    <Badge key={genreItem.mal_id} variant="outline" className="text-xs">
                      {genreItem.name}
                    </Badge>
                  ))}
                  {anime.genres && anime.genres.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{anime.genres.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={() => onEdit(anime)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(anime.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}