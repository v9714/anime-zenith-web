import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { X, Upload } from "lucide-react";
import { Anime } from "@/services/api";
import dropdownOptions from "@/data/dropdown-options.json";
import { useToast } from "@/hooks/use-toast";
import backendAPI from "@/services/backendApi";
import { getImageUrl } from "@/utils/commanFunction";

const animeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  alternativeTitles: z.array(z.string()).default([]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  coverImageType: z.enum(["url", "upload"]).default("url"),
  coverImageUrl: z.string().optional(),
  coverImageFile: z.any().optional(),
  bannerImageType: z.enum(["url", "upload"]).default("url"),
  bannerImageUrl: z.string().optional(),
  bannerImageFile: z.any().optional(),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 5),
  season: z.enum(["FALL", "SPRING", "SUMMER", "WINTER"]),
  seasonNumber: z.coerce.number().min(1),
  status: z.enum(["ONGOING", "COMPLETED", "UPCOMING"]),
  type: z.enum(["TV", "MOVIE", "OVA", "SPECIAL"]),
  rating: z.coerce.number().min(0).max(10).optional(),
  votesCount: z.coerce.number().default(0),
  studio: z.string().optional(),
  episodeDuration: z.string().optional(),
  isDeleted: z.boolean().default(false),
}).refine((data) => {
  if (data.coverImageType === "url" && !data.coverImageUrl) {
    return false;
  }
  if (data.coverImageType === "upload" && !data.coverImageFile) {
    return false;
  }
  if (data.bannerImageType === "url" && !data.bannerImageUrl) {
    return false;
  }
  if (data.bannerImageType === "upload" && !data.bannerImageFile) {
    return false;
  }
  return true;
}, {
  message: "Cover image and banner image are required",
});

type AnimeFormValues = z.infer<typeof animeFormSchema>;

interface AnimeFormProps {
  anime?: Anime;
  onSubmit: (data: FormData | AnimeFormValues, anime?: Anime) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AnimeForm({ anime, onSubmit, onCancel, isLoading = false }: AnimeFormProps) {
  const { toast } = useToast();
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    anime?.coverImage ? getImageUrl(anime.coverImage) : null
  );
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(
    anime?.bannerImage ? getImageUrl(anime.bannerImage) : null
  );
  const [alternativeTitleInput, setAlternativeTitleInput] = useState("");
  const [deleteImageLoading, setDeleteImageLoading] = useState<string>("");
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AnimeFormValues>({
    resolver: zodResolver(animeFormSchema),
    defaultValues: {
      title: anime?.title || "",
      alternativeTitles: anime?.alternativeTitles || [],
      description: anime?.description || "",
      coverImageType: "url",
      coverImageUrl: anime?.coverImage || "",
      bannerImageType: "url", 
      bannerImageUrl: anime?.bannerImage || "",
      year: anime?.year || new Date().getFullYear(),
      season: (anime?.season as "FALL" | "SPRING" | "SUMMER" | "WINTER") || "SPRING",
      seasonNumber: anime?.seasonNumber || 1,
      status: (anime?.status as "ONGOING" | "COMPLETED" | "UPCOMING") || "ONGOING",
      type: "TV",
      rating: anime?.rating ? parseFloat(anime.rating) : undefined,
      votesCount: anime?.votesCount || 0,
      studio: anime?.studio || "",
      episodeDuration: anime?.episodeDuration || "",
      isDeleted: anime?.isDeleted,
    }
  });

  const handleSubmit = async (data: AnimeFormValues) => {
    // Create FormData for file uploads
    const formData = new FormData();

    // Add basic fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('year', data.year.toString());
    formData.append('season', data.season);
    formData.append('seasonNumber', data.seasonNumber.toString());
    formData.append('status', data.status);
    formData.append('type', data.type);
    formData.append('votesCount', data.votesCount.toString());
    formData.append('isDeleted', data.isDeleted.toString());

    // Add optional fields if they exist
    if (data.rating) formData.append('rating', data.rating.toString());
    if (data.studio) formData.append('studio', data.studio);
    if (data.episodeDuration) formData.append('episodeDuration', data.episodeDuration);

    // Add alternative titles as JSON string
    if (data.alternativeTitles.length > 0) {
      formData.append('alternativeTitles', JSON.stringify(data.alternativeTitles));
    }

    // Handle cover image
    if (data.coverImageType === 'upload' && data.coverImageFile) {
      formData.append('coverImage', data.coverImageFile);
    } else if (data.coverImageType === 'url' && data.coverImageUrl) {
      formData.append('coverImageUrl', data.coverImageUrl);
    }

    // Handle banner image
    if (data.bannerImageType === 'upload' && data.bannerImageFile) {
      formData.append('bannerImage', data.bannerImageFile);
    } else if (data.bannerImageType === 'url' && data.bannerImageUrl) {
      formData.append('bannerImageUrl', data.bannerImageUrl);
    }

    onSubmit(formData, anime);
  };

  const handleFileUpload = (file: File, type: 'cover' | 'banner') => {
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'cover') {
        setCoverImagePreview(url);
        form.setValue('coverImageFile', file);
      } else {
        setBannerImagePreview(url);
        form.setValue('bannerImageFile', file);
      }
    }
  };

  const handleUrlChange = (url: string, type: 'cover' | 'banner') => {
    if (type === 'cover') {
      setCoverImagePreview(url);
      form.setValue('coverImageUrl', url);
    } else {
      setBannerImagePreview(url);
      form.setValue('bannerImageUrl', url);
    }
  };

  const addAlternativeTitle = () => {
    if (alternativeTitleInput.trim()) {
      const current = form.getValues('alternativeTitles');
      form.setValue('alternativeTitles', [...current, alternativeTitleInput.trim()]);
      setAlternativeTitleInput("");
    }
  };

  const removeAlternativeTitle = (index: number) => {
    const current = form.getValues('alternativeTitles');
    form.setValue('alternativeTitles', current.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (imageType: 'cover' | 'banner') => {
    if (!anime?.id) return;
    
    setDeleteImageLoading(imageType);
    
    try {
      const imagePath = imageType === 'cover' ? anime.coverImage : anime.bannerImage;
      if (!imagePath) return;

      const isDbImage = imagePath.startsWith('/uploads/');
      
      const response = await backendAPI.post(`/api/admin/anime/${anime.id}/delete-image`, {
        imageType,
        imagePath,
        isDbImage
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: `${imageType} image deleted successfully`,
          id: Math.random().toString(),
        });

        // Clear the image preview and form value
        if (imageType === 'cover') {
          setCoverImagePreview("");
          form.setValue("coverImageUrl", "");
        } else {
          setBannerImagePreview("");
          form.setValue("bannerImageUrl", "");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${imageType} image`,
        id: Math.random().toString(),
      });
    } finally {
      setDeleteImageLoading("");
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto pt-3">
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
                    <FormLabel>Title *</FormLabel>
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
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dropdownOptions.types.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Alternative Titles */}
            <FormField
              control={form.control}
              name="alternativeTitles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alternative Titles</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add alternative title"
                        value={alternativeTitleInput}
                        onChange={(e) => setAlternativeTitleInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlternativeTitle())}
                      />
                      <Button type="button" onClick={addAlternativeTitle} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((title, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {title}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeAlternativeTitle(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
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
              {/* Cover Image */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="coverImageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image *</FormLabel>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.value === "upload"}
                          onCheckedChange={(checked) => field.onChange(checked ? "upload" : "url")}
                        />
                        <span className="text-sm">
                          {field.value === "upload" ? "Upload File" : "Use URL"}
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("coverImageType") === "url" ? (
                  <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/cover.jpg"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleUrlChange(e.target.value, 'cover');
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'cover');
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Cover Image
                    </Button>
                  </div>
                )}

                {coverImagePreview && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-32 h-48 object-cover rounded-md"
                    />
                    {anime?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            disabled={deleteImageLoading === 'cover'}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Cover Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this cover image? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteImage('cover')}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </div>

              {/* Banner Image */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="bannerImageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image *</FormLabel>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.value === "upload"}
                          onCheckedChange={(checked) => field.onChange(checked ? "upload" : "url")}
                        />
                        <span className="text-sm">
                          {field.value === "upload" ? "Upload File" : "Use URL"}
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("bannerImageType") === "url" ? (
                  <FormField
                    control={form.control}
                    name="bannerImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/banner.jpg"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleUrlChange(e.target.value, 'banner');
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      ref={bannerFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'banner');
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Banner Image
                    </Button>
                  </div>
                )}

                {bannerImagePreview && (
                  <div className="mt-2 relative inline-block w-full">
                    <img
                      src={bannerImagePreview}
                      alt="Banner preview"
                      className="w-full h-24 object-cover rounded-md"
                    />
                    {anime?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            disabled={deleteImageLoading === 'banner'}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Banner Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this banner image? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteImage('banner')}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
                    <FormLabel>Year *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="YYYY" {...field} />
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
                    <FormLabel>Season *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dropdownOptions.seasons.map((season) => (
                          <SelectItem key={season.value} value={season.value}>
                            {season.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seasonNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season Number *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dropdownOptions.statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        placeholder="8.5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Scale: 0.0 - 10.0</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="episodeDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Episode Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="24 min per ep" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Admin Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Admin Settings</h3>
              <FormField
                control={form.control}
                name="isDeleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Hide from users</FormLabel>
                      <FormDescription>
                        If checked, this anime will be hidden from users but visible to admins
                      </FormDescription>
                    </div>
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