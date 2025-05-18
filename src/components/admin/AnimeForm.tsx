
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Anime } from "@/services/api";
import { format } from "date-fns";
import { FileImage, Upload } from "lucide-react";
import { toast } from "sonner";

const animeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  cover_image_url: z.string().min(1, "Cover image is required"),
  banner_image_url: z.string().optional(),
  type: z.enum(["TV", "Movie", "OVA", "Special"]),
  genres: z.string().min(1, "At least one genre is required"),
  status: z.enum(["Airing", "Completed", "Upcoming"]),
  release_date: z.string(),
  total_episodes: z.coerce.number().int().min(1, "Episodes must be at least 1"),
});

type AnimeFormValues = z.infer<typeof animeFormSchema>;

interface AnimeFormProps {
  anime?: Anime;
  onSubmit: (data: Anime) => void;
}

export function AnimeForm({ anime, onSubmit }: AnimeFormProps) {
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    anime?.images.jpg.image_url || null
  );
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(
    anime?.images.jpg.large_image_url || null
  );

  const form = useForm<AnimeFormValues>({
    resolver: zodResolver(animeFormSchema),
    defaultValues: anime ? {
      title: anime.title,
      description: anime.synopsis,
      cover_image_url: anime.images.jpg.image_url,
      banner_image_url: anime.images.jpg.large_image_url,
      type: anime.type as "TV" | "Movie" | "OVA" | "Special",
      genres: anime.genres?.map(g => g.name).join(", ") || "",
      status: anime.airing ? "Airing" : "Completed",
      release_date: anime.aired?.from ? format(new Date(anime.aired.from), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      total_episodes: anime.episodes,
    } : {
      title: "",
      description: "",
      cover_image_url: "",
      banner_image_url: "",
      type: "TV",
      genres: "",
      status: "Upcoming",
      release_date: format(new Date(), 'yyyy-MM-dd'),
      total_episodes: 1,
    },
  });

  // Handle image file uploads
  const handleImageUpload = (file: File, type: 'cover' | 'banner') => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.includes('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'cover') {
        form.setValue('cover_image_url', result);
        setCoverImagePreview(result);
      } else {
        form.setValue('banner_image_url', result);
        setBannerImagePreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (data: AnimeFormValues) => {
    // Transform the form data into the Anime format
    const genresList = data.genres.split(',').map(genre => genre.trim()).filter(Boolean);
    
    const newAnime: Anime = {
      mal_id: anime?.mal_id || Math.floor(Math.random() * 10000),
      title: data.title,
      title_english: anime?.title_english || data.title,
      title_japanese: anime?.title_japanese || "",
      images: {
        jpg: {
          image_url: data.cover_image_url,
          small_image_url: data.cover_image_url,
          large_image_url: data.banner_image_url || data.cover_image_url,
        },
        webp: {
          image_url: data.cover_image_url,
          small_image_url: data.cover_image_url,
          large_image_url: data.banner_image_url || data.cover_image_url,
        }
      },
      type: data.type,
      episodes: data.total_episodes,
      status: data.status === "Airing" ? "Currently Airing" : data.status === "Completed" ? "Finished Airing" : "Not yet aired",
      airing: data.status === "Airing",
      synopsis: data.description,
      score: anime?.score || 0,
      genres: genresList.map((name, index) => ({ mal_id: index + 1, name })),
      rating: anime?.rating || "",
      aired: {
        from: data.release_date,
        to: anime?.aired?.to || null,
      },
      season: anime?.season || "",
      year: new Date(data.release_date).getFullYear(),
      duration: anime?.duration || "24 min per ep",
      trailer: anime?.trailer || {
        youtube_id: "",
        url: "",
      },
    };

    onSubmit(newAnime);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a description of the anime"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cover_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {coverImagePreview ? (
                      <div className="flex flex-col gap-2">
                        <div className="relative h-40 w-32 overflow-hidden rounded-md border border-border">
                          <img
                            src={coverImagePreview}
                            alt="Cover preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCoverImagePreview(null);
                              form.setValue('cover_image_url', '');
                            }}
                          >
                            Remove
                          </Button>
                          <div className="relative">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Change
                            </Button>
                            <Input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleImageUpload(e.target.files[0], 'cover');
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-md hover:border-primary/50 transition-colors">
                        <FileImage className="h-10 w-10 text-muted-foreground mb-2" />
                        <div className="flex flex-col items-center justify-center text-center">
                          <p className="text-sm font-medium mb-1">
                            Drag & drop or click to upload
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recommended: 350x500px (max 5MB)
                          </p>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0], 'cover');
                            }
                          }}
                        />
                        <input type="hidden" {...field} />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="banner_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Image (optional)</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {bannerImagePreview ? (
                      <div className="flex flex-col gap-2">
                        <div className="relative h-32 w-full overflow-hidden rounded-md border border-border">
                          <img
                            src={bannerImagePreview}
                            alt="Banner preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBannerImagePreview(null);
                              form.setValue('banner_image_url', '');
                            }}
                          >
                            Remove
                          </Button>
                          <div className="relative">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Change
                            </Button>
                            <Input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleImageUpload(e.target.files[0], 'banner');
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-md hover:border-primary/50 transition-colors">
                        <FileImage className="h-10 w-10 text-muted-foreground mb-2" />
                        <div className="flex flex-col items-center justify-center text-center">
                          <p className="text-sm font-medium mb-1">
                            Drag & drop or click to upload
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recommended: 1280x720px (max 5MB)
                          </p>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0], 'banner');
                            }
                          }}
                        />
                        <input type="hidden" {...field} />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Airing">Airing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="total_episodes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Episodes</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="release_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Release Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="genres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genres (comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="Action, Adventure, Comedy" {...field} />
              </FormControl>
              <FormDescription>
                Enter genres separated by commas (e.g., Action, Adventure, Comedy)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit">
            {anime ? "Update Anime" : "Add Anime"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
