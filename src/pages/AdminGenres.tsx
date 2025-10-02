import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { genreService } from "@/services/genreService";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

const AdminGenres = () => {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [newGenreName, setNewGenreName] = useState("");
    const [editingGenre, setEditingGenre] = useState<{ id: number; name: string } | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch genres
    const { data: genresData, isLoading } = useQuery({
        queryKey: ['admin-genres'],
        queryFn: genreService.getAllGenres,
    });

    // Create genre mutation
    const createMutation = useMutation({
        mutationFn: (name: string) => genreService.createGenre(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
            toast({
                id: String(Date.now()),
                title: "Genre created successfully",
                description: "The genre has been added to the system"
            });
            setIsAddDialogOpen(false);
            setNewGenreName("");
        },
        onError: () => {
            toast({
                id: String(Date.now()),
                title: "Failed to create genre",
                description: "An error occurred while creating the genre"
            });
        }
    });

    // Update genre mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, name }: { id: number; name: string }) => genreService.updateGenre(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
            toast({
                id: String(Date.now()),
                title: "Genre updated successfully",
                description: "The genre has been updated"
            });
            setIsEditDialogOpen(false);
            setEditingGenre(null);
        },
        onError: () => {
            toast({
                id: String(Date.now()),
                title: "Failed to update genre",
                description: "An error occurred while updating the genre"
            });
        }
    });

    // Delete genre mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => genreService.deleteGenre(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
            toast({
                id: String(Date.now()),
                title: "Genre deleted successfully",
                description: "The genre has been removed from the system"
            });
        },
        onError: () => {
            toast({
                id: String(Date.now()),
                title: "Failed to delete genre",
                description: "An error occurred while deleting the genre"
            });
        }
    });

    const handleCreate = () => {
        if (newGenreName.trim()) {
            createMutation.mutate(newGenreName.trim());
        }
    };

    const handleUpdate = () => {
        if (editingGenre && editingGenre.name.trim()) {
            updateMutation.mutate({ id: editingGenre.id, name: editingGenre.name.trim() });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this genre?")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto py-8 px-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Genre Management</CardTitle>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Genre
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Genre</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="genre-name">Genre Name</Label>
                                        <Input
                                            id="genre-name"
                                            value={newGenreName}
                                            onChange={(e) => setNewGenreName(e.target.value)}
                                            placeholder="Enter genre name"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleCreate}
                                        disabled={!newGenreName.trim() || createMutation.isPending}
                                        className="w-full"
                                    >
                                        {createMutation.isPending ? "Creating..." : "Create Genre"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">Loading genres...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {genresData?.data.map((genre) => (
                                        <TableRow key={genre.id}>
                                            <TableCell>{genre.id}</TableCell>
                                            <TableCell>{genre.name}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingGenre(genre);
                                                        setIsEditDialogOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(genre.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Genre</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-genre-name">Genre Name</Label>
                                <Input
                                    id="edit-genre-name"
                                    value={editingGenre?.name || ""}
                                    onChange={(e) => setEditingGenre(prev => prev ? { ...prev, name: e.target.value } : null)}
                                    placeholder="Enter genre name"
                                />
                            </div>
                            <Button
                                onClick={handleUpdate}
                                disabled={!editingGenre?.name.trim() || updateMutation.isPending}
                                className="w-full"
                            >
                                {updateMutation.isPending ? "Updating..." : "Update Genre"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminGenres;