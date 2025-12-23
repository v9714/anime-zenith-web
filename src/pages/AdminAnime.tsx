/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AnimeForm } from "@/components/admin/AnimeForm";
import { AnimeTable } from "@/components/admin/AnimeTable";
import { AnimePagination } from "@/components/admin/AnimePagination";
import { AnimeFilters } from "@/components/admin/AnimeFilters";
import { Anime } from "@/services/api";
import { adminAnimeService, AnimeFilters as AnimeFiltersType } from "@/services/adminAnimeService";
import { toast } from "sonner";

const AdminAnime = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<AnimeFiltersType>({});
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteAnimeId, setDeleteAnimeId] = useState<string | number | null>(null);

  const itemsPerPage = 20;

  const fetchAnimes = async () => {
    try {
      setLoading(true);
      const response = await adminAnimeService.getPaginatedAnime(
        currentPage,
        itemsPerPage,
        {
          search: searchQuery || undefined,
          ...filters
        }
      );

      if (response.success) {
        setAnimes(response.data.anime);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalAnime);
      } else {
        toast.error("Failed to fetch anime data");
      }
    } catch (error: any) {
      console.error("Error fetching animes:", error);
      toast.error(error.response?.data?.message || "Failed to fetch anime data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimes();
  }, [currentPage, searchQuery, filters]);

  const handleSubmit = async (formData: any, anime?: Anime) => {
    setIsLoading(true);
    try {
      let response;
      if (anime?.id) {
        // Update existing anime
        response = await adminAnimeService.updateAnime(anime.id, formData);
        toast.success(response.message || "Anime updated successfully");
      } else {
        // Create new anime
        response = await adminAnimeService.createAnime(formData);
        toast.success(response.message || "Anime created successfully");
      }

      setDialogOpen(false);
      setEditingAnime(null);
      
      // Refresh the anime list to show updated data
      await fetchAnimes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (anime: Anime) => {
    setEditingAnime(anime);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingAnime(null);
    setDialogOpen(true);
  };

  const handleFilterChange = (key: keyof AnimeFiltersType, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDelete = async (id: string | number) => {
    try {
      setIsLoading(true);
      const response = await adminAnimeService.deleteAnime(id);
      setAnimes(animes.filter(anime => anime.id !== id));
      toast.success(response.message || "Anime deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete anime");
    } finally {
      setIsLoading(false);
      setDeleteAnimeId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-anime-primary to-anime-secondary bg-clip-text text-transparent">
            Anime Management
          </h1>

          {/* <Dialog open={dialogOpen} onOpenChange={setDialogOpen}> */}
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingAnime(null);
          }}>
            <DialogTrigger asChild>
              {/* <Button className="bg-primary hover:bg-primary/90"> */}
              <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Anime
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>{editingAnime ? 'Edit Anime' : 'Add New Anime'}</DialogTitle>
                <DialogDescription>
                  {editingAnime ? 'Update anime information' : 'Fill in the details to add a new anime to the database.'}
                </DialogDescription>
              </DialogHeader>
              <AnimeForm
                anime={editingAnime || undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setDialogOpen(false);
                  setEditingAnime(null);
                }}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>

        <AnimeFilters
          searchQuery={searchQuery}
          filters={filters}
          onSearchChange={handleSearch}
          onFilterChange={handleFilterChange}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Anime List ({totalCount} total)
            </CardTitle>
            {loading && <Badge variant="outline">Loading...</Badge>}
          </CardHeader>
          <CardContent>
            <AnimeTable
              animes={animes}
              loading={loading}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteAnimeId(id)}
            />

            <AnimePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteAnimeId} onOpenChange={() => setDeleteAnimeId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Anime</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this anime? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAnimeId && handleDelete(deleteAnimeId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAnime;