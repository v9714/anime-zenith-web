import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Anime } from "@/services/api";
import { format } from "date-fns";

const animeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cover_image_url: z.string().url("Must be a valid URL"),
  banner_image_url: z.string().url("Must be a valid URL").optional(),
  type: z.enum(["TV", "Movie", "OVA", "Special"]),
  genres: z.string().min(1, "At least one genre is required"),
  status: z.enum(["Completed", "Airing", "Not Yet Aired"]),
  release_date: z.string(),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 5),
  season: z.enum(["Winter", "Spring", "Summer", "Fall"]).optional(),
  studio: z.string().optional(),
  rating: z.string().optional(),
});

type AnimeFormValues = z.infer<typeof animeFormSchema>;

interface AnimeFormProps {
  anime?: Anime;
  onSubmit: (anime: Anime) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AnimeForm({ anime, onSubmit, onCancel, isLoading = false }: AnimeFormProps) {
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    anime?.coverImage || null
  );
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(
    anime?.bannerImage || null
  );

  const form = useForm<AnimeFormValues>({
    resolver: zodResolver(animeFormSchema),
    defaultValues: anime ? {
      title: anime.title,
      description: anime.description || "",
      cover_image_url: anime.coverImage || "",
      banner_image_url: anime.bannerImage || "",
      type: anime.type as "TV" | "Movie" | "OVA" | "Special" || "TV",
      genres: anime.genres?.map(g => g.name).join(", ") || "",
      status: anime.status as "Completed" | "Airing" | "Not Yet Aired" || "Completed",
      release_date: anime.year ? `${anime.year}-01-01` : format(new Date(), 'yyyy-MM-dd'),
      year: anime.year || new Date().getFullYear(),
      season: anime.season as "Winter" | "Spring" | "Summer" | "Fall" || "Winter",
      studio: anime.studio || "",
      rating: anime.rating || "",
    } : {
      title: "",
      description: "",
      cover_image_url: "",
      banner_image_url: "",
      type: "TV",
      genres: "",
      status: "Completed",
      release_date: format(new Date(), 'yyyy-MM-dd'),
      year: new Date().getFullYear(),
      season: "Winter",
      studio: "",
      rating: "",
    }
  });

  const handleSubmit = (data: AnimeFormValues) => {
    const genresList = data.genres.split(",").map(g => g.trim()).filter(g => g.length > 0);
    
    const newAnime: Anime = {
      id: anime?.id || `anime_${Date.now()}`,
      title: data.title,
      alternativeTitles: [data.title],
      description: data.description,
      coverImage: data.cover_image_url,
      bannerImage: data.banner_image_url || data.cover_image_url,
      year: data.year,
      season: data.season || "Winter",
      status: data.status,
      type: data.type,
      rating: data.rating || "0",
      studio: data.studio || "",
      genres: genresList.map((name, index) => ({ mal_id: index + 1, name })),
    };

    onSubmit(newAnime);
  };

  const handleCoverImageChange = (url: string) => {
    setCoverImagePreview(url);
    form.setValue('cover_image_url', url);
  };

  const handleBannerImageChange = (url: string) => {
    setBannerImagePreview(url);
    form.setValue('banner_image_url', url);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{anime ? 'Edit Anime' : 'Add New Anime'}</CardTitle>
        <CardDescription>
          {anime ? 'Update anime information' : 'Fill in the details to add a new anime'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Anime title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TV">TV</SelectItem>
                        <SelectItem value="Movie">Movie</SelectItem>
                        <SelectItem value="OVA">OVA</SelectItem>
                        <SelectItem value="Special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Anime description/synopsis" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/cover.jpg"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleCoverImageChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {coverImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={coverImagePreview} 
                      alt="Cover preview" 
                      className="w-32 h-48 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="banner_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/banner.jpg"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleBannerImageChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {bannerImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={bannerImagePreview} 
                      alt="Banner preview" 
                      className="w-full h-24 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Winter">Winter</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Fall">Fall</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Airing">Airing</SelectItem>
                        <SelectItem value="Not Yet Aired">Not Yet Aired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input placeholder="0-10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="studio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Studio</FormLabel>
                    <FormControl>
                      <Input placeholder="Animation studio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genres</FormLabel>
                    <FormControl>
                      <Input placeholder="Action, Adventure, Drama (comma separated)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Separate multiple genres with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (anime ? 'Update Anime' : 'Add Anime')}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}