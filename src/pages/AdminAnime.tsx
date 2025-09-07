/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AnimeForm } from "@/components/admin/AnimeForm";
import { Anime } from "@/services/api";
import { getImageUrl } from "@/utils/commanFunction";
import { adminAnimeService, AnimeFilters } from "@/services/adminAnimeService";
// import { toast } from "@/hooks/use-toast";
import { toast } from "sonner";

const AdminAnime = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<AnimeFilters>({});
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (error) {
      console.error("Error fetching animes:", error);
      toast.error(error.response?.message || "Failed to fetch anime data");
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
      const animeData = {
        title: formData.title,
        alternativeTitles: formData.alternativeTitles,
        description: formData.description,
        coverImage: formData.coverImageUrl,
        bannerImage: formData.bannerImageUrl,
        year: formData.year,
        season: formData.season,
        seasonNumber: formData.seasonNumber,
        status: formData.status,
        type: formData.type,
        rating: formData.rating,
        votesCount: formData.votesCount,
        studio: formData.studio,
        episodeDuration: formData.episodeDuration,
        isDeleted: formData.isDeleted
      };

      let response;
      if (anime?.id) {
        // Update existing anime
        response = await adminAnimeService.updateAnime(anime.id, animeData);
        const updatedAnimes = animes.map(a =>
          a.id === anime.id ? { ...a, ...response.data } : a
        );
        setAnimes(updatedAnimes);
        toast.success(response.message || "Anime updated successfully");
      } else {
        // Create new anime
        response = await adminAnimeService.createAnime(animeData);
        setAnimes([...animes, response.data]);
        toast.success(response.message || "Anime created successfully");
      }

      setDialogOpen(false);
      setEditingAnime(null);
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

  const handleFilterChange = (key: keyof AnimeFilters, value: string | number | undefined) => {
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

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search anime..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <Select value={filters?.status || "All"} onValueChange={(value) => handleFilterChange('status', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Airing">Airing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type || "All"} onValueChange={(value) => handleFilterChange('type', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="TV">TV</SelectItem>
                  <SelectItem value="Movie">Movie</SelectItem>
                  <SelectItem value="OVA">OVA</SelectItem>
                  <SelectItem value="ONA">ONA</SelectItem>
                  <SelectItem value="Special">Special</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Filter by year"
                value={filters.year || ""}
                onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Anime List ({totalCount} total)
            </CardTitle>
            {loading && <Badge variant="outline">Loading...</Badge>}
          </CardHeader>
          <CardContent>
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
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
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
                    ))
                  ) : animes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No anime found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    animes.map((anime) => (
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
                            variant={anime.status === "Airing" ? "default" : "secondary"}
                            className={anime.status === "Airing"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            }
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
                              onClick={() => handleEdit(anime)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {generatePageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page as number);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnime;