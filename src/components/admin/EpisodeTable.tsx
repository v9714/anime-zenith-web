import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Film, Clock, Eye } from "lucide-react";
import { Episode } from "@/services/episodeService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EpisodeTableProps {
  episodes: Episode[];
  loading: boolean;
  onEdit: (episode: Episode) => void;
  onDelete: (id: number) => void;
}

export function EpisodeTable({ episodes, loading, onEdit, onDelete }: EpisodeTableProps) {
  const getProcessingStatusBadge = (status: string) => {
    switch (status) {
      case "READY":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "QUEUED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Episode ID</TableHead>
            <TableHead>Anime ID</TableHead>
            <TableHead>Anime</TableHead>
            <TableHead>Episode</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Aired Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {episodes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                No episodes found
              </TableCell>
            </TableRow>
          ) : (
            episodes.map((episode) => (
              <TableRow key={episode.id}>
                <TableCell className="font-medium text-muted-foreground">
                  #{episode.id}
                </TableCell>
                <TableCell className="font-medium text-muted-foreground">
                  #{episode.animeId}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <Film className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{episode.animeTitle}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">#{episode.episodeNumber}</TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate">{episode.title}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{formatDuration(episode.duration)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={getProcessingStatusBadge(episode.processingStatus)}
                  >
                    {episode.processingStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{episode.views || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(episode.airDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onEdit(episode)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Episode</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{episode.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => episode.id && onDelete(episode.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}