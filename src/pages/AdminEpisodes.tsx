/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { EpisodeForm } from "@/components/admin/EpisodeForm";
import { EpisodeTable } from "@/components/admin/EpisodeTable";
import { EpisodeFilters } from "@/components/admin/EpisodeFilters";
import { EpisodePagination } from "@/components/admin/EpisodePagination";
import { episodeService, type Episode, type EpisodeFilters as EpisodeFiltersType } from "@/services/episodeService";
import { toast } from "@/components/ui/use-toast";

const AdminEpisodes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [filters, setFilters] = useState<EpisodeFiltersType>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await episodeService.getPaginatedEpisodes(
        currentPage,
        20,
        {
          search: searchQuery || undefined,
          ...filters
        }
      );
      if (response.success) {
        setEpisodes(response.data.episodes);
        setTotalPages(response.data.totalPages);
        setTotalEpisodes(response.data.total);
      } else {
        throw new Error(response.message || 'Failed to fetch episodes');
      }
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch episodes. Please try again.",
        id: Date.now().toString(),
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filters]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: keyof EpisodeFiltersType, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleAddEpisode = async (episodeData: any) => {
    try {
      if (!selectedEpisode) setCreating(true);
      const formData = new FormData();

      Object.keys(episodeData).forEach(key => {
        if (episodeData[key] !== undefined && episodeData[key] !== null) {
          if (key === 'thumbnailFile' || key === 'sourceFile') {
            if (episodeData[key]) {
              formData.append(key, episodeData[key]);
            }
          } else if (key === 'airDate') {
            formData.append(key, episodeData[key].toISOString());
          } else if (key === 'thumbnailType' || key === 'videoSourceType') {
            // Skip these fields, they're just for UI control
            return;
          } else {
            // Handle conditional fields based on type
            if (key === 'thumbnailUrl' && episodeData.thumbnailType === 'upload') {
              // Don't include thumbnailUrl if using file upload
              return;
            }
            if (key === 'masterUrl' && episodeData.videoSourceType === 'upload') {
              // Don't include masterUrl if using file upload
              return;
            }
            formData.append(key, episodeData[key].toString());
          }
        }
      });

      if (selectedEpisode?.id) {
        setUploadProgress(0);
        const response = await episodeService.updateEpisode(
          selectedEpisode.id,
          formData,
          (progress) => setUploadProgress(progress)
        );
        // updateEpisode currently throws on error (no try-catch in service), so we don't need to check response here if consistent, 
        // but if we want to be safe in case service changes:
        // However, looking at service, it returns response.data directly without wrapping in try-catch for update.
        // So axios will throw.
        toast({
          title: "Success",
          description: "Episode updated successfully",
          id: Date.now().toString(),
        });
      } else {
        setUploadProgress(0);
        const response = await episodeService.createEpisode(
          formData,
          (progress) => setUploadProgress(progress)
        );
        // createEpisode CATCHES error and returns it, so we MUST check success.
        if (response && response.success === false) {
          throw new Error(response.message || "Failed to create episode");
        }

        toast({
          title: "Success",
          description: "Episode created successfully",
          id: Date.now().toString(),
        });
      }

      setDialogOpen(false);
      setSelectedEpisode(undefined);
      fetchEpisodes();
    } catch (error: any) {
      console.error('Error saving episode:', error);
      toast({
        title: "Error",
        description: error.message || error.response?.data?.message || "Failed to save episode. Please try again.",
        // variant: "destructive",
        id: Date.now().toString(),
      });
    } finally {
      setCreating(false);
      setUploadProgress(0);
    }
  };

  const handleEditEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
    setDialogOpen(true);
  };

  const handleDeleteEpisode = async (id: number) => {
    try {
      await episodeService.deleteEpisode(id);
      toast({
        title: "Success",
        description: "Episode deleted successfully",
        id: Date.now().toString(),
      });
      fetchEpisodes();
    } catch (error) {
      console.error('Error deleting episode:', error);
      toast({
        title: "Error",
        description: "Failed to delete episode. Please try again.",
        id: Date.now().toString(),
      });
    }
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedEpisode(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Episode Management</h1>
          <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button disabled={creating}>
                <PlusCircle className="h-4 w-4 mr-2" />
                {creating ? "Creating..." : "Add New Episode"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedEpisode ? "Edit Episode" : "Add New Episode"}
                </DialogTitle>
                <DialogDescription>
                  {selectedEpisode
                    ? "Update the episode details below."
                    : "Fill in the details to add a new episode to the database."
                  }
                </DialogDescription>
              </DialogHeader>
              <EpisodeForm
                episode={selectedEpisode}
                onSubmit={handleAddEpisode}
                creating={creating}
                uploadProgress={uploadProgress}
              />
            </DialogContent>
          </Dialog>
        </div>

        <EpisodeFilters
          searchQuery={searchInput}
          filters={filters}
          onSearchChange={handleSearch}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        <EpisodeTable
          episodes={episodes}
          loading={loading}
          onEdit={handleEditEpisode}
          onDelete={handleDeleteEpisode}
        />

        <EpisodePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalEpisodes={totalEpisodes}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminEpisodes;