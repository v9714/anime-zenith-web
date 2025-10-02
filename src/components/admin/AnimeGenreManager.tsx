import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { genreService, Genre } from "@/services/genreService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

interface AnimeGenreManagerProps {
    animeId: string | number;
    currentGenres: Genre[];
}

export const AnimeGenreManager = ({ animeId, currentGenres }: AnimeGenreManagerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch all available genres
    const { data: allGenresData } = useQuery({
        queryKey: ['all-genres'],
        queryFn: genreService.getAllGenres,
        enabled: isOpen,
    });

    // Add genre mutation
    const addGenreMutation = useMutation({
        mutationFn: (genreId: number) => genreService.addGenreToAnime(animeId, genreId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anime', animeId] });
            toast({
                id: String(Date.now()),
                title: "Genre added successfully",
                description: "The genre has been added to the anime"
            });
        },
        onError: () => {
            toast({
                id: String(Date.now()),
                title: "Failed to add genre",
                description: "An error occurred while adding the genre"
            });
        }
    });

    // Remove genre mutation
    const removeGenreMutation = useMutation({
        mutationFn: (genreId: number) => genreService.removeGenreFromAnime(animeId, genreId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anime', animeId] });
            toast({
                id: String(Date.now()),
                title: "Genre removed successfully",
                description: "The genre has been removed from the anime"
            });
        },
        onError: () => {
            toast({
                id: String(Date.now()),
                title: "Failed to remove genre",
                description: "An error occurred while removing the genre"
            });
        }
    });

    const currentGenreIds = currentGenres.map(g => g.id);
    const availableGenres = allGenresData?.data.filter(g => !currentGenreIds.includes(g.id)) || [];

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Genres</label>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Genre
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Genre to Anime</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                            {availableGenres.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No more genres available to add</p>
                            ) : (
                                availableGenres.map((genre) => (
                                    <Button
                                        key={genre.id}
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            addGenreMutation.mutate(genre.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        {genre.name}
                                    </Button>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-wrap gap-2">
                {currentGenres.map((genre) => (
                    <Badge key={genre.id} variant="secondary" className="gap-1">
                        {genre.name}
                        <button
                            onClick={() => removeGenreMutation.mutate(genre.id)}
                            className="ml-1 hover:text-destructive"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                {currentGenres.length === 0 && (
                    <span className="text-sm text-muted-foreground">No genres assigned</span>
                )}
            </div>
        </div>
    );
};
