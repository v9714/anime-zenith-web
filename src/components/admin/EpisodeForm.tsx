/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { AnimeSearchInput } from "./AnimeSearchInput";
import { DurationInput } from "./DurationInput";
import { episodeService, type Episode } from "@/services/episodeService";
import { getImageUrl } from "@/utils/commanFunction";
import { useToast } from "@/components/ui/use-toast";

// Dynamic Schema Creation
const createEpisodeFormSchema = (isUpdate: boolean) => z.object({
  animeId: z.number().min(1, "Please select an anime"),
  animeTitle: z.string().min(1, "Anime title is required"),
  episodeNumber: z.coerce.number().min(1, "Episode number must be at least 1"),
  title: z.string().min(1, "Episode title is required"),
  thumbnailType: z.enum(["url", "upload"]),
  thumbnailUrl: z.string().optional(),
  thumbnailFile: z.any().optional(),
  videoSourceType: z.enum(["url", "upload"]),
  masterUrl: z.string().optional(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  description: z.string().min(1, "Description is required"),
  airDate: z.date({ required_error: "Air date is required" }),
  isDeleted: z.boolean(),
  commentsEnabled: z.boolean(),
  loginRequired: z.boolean(),
  isFiller: z.boolean(),
  sourceFile: z.any().optional(),
}).refine((data) => {
  if (data.thumbnailType === "url") {
    return data.thumbnailUrl && data.thumbnailUrl.length > 0;
  } else {
    // If update, file is optional (keep existing)
    if (isUpdate) return true;
    return data.thumbnailFile;
  }
}, {
  message: "Please provide either a thumbnail URL or upload a thumbnail file",
  path: ["thumbnailUrl"],
}).refine((data) => {
  if (data.videoSourceType === "url") {
    // If URL mode, check masterUrl
    return data.masterUrl && data.masterUrl.length > 0;
  } else {
    // If Upload mode
    if (isUpdate) return true; // Optional on update
    return data.sourceFile;
  }
}, {
  message: "Please provide either a master URL or upload a source file",
  path: ["masterUrl"],
});

type EpisodeFormData = z.infer<ReturnType<typeof createEpisodeFormSchema>>;

interface AnimeOption {
  id: number;
  title: string;
}

interface EpisodeFormProps {
  episode?: Episode;
  onSubmit: (data: EpisodeFormData) => void;
  creating?: boolean;
  uploadProgress?: number;
}

export function EpisodeForm({ episode, onSubmit, creating = false, uploadProgress = 0 }: EpisodeFormProps) {
  const { toast } = useToast();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    episode?.thumbnail ? getImageUrl(episode.thumbnail) : null
  );
  const [deleteImageLoading, setDeleteImageLoading] = useState<boolean>(false);
  const isUpdate = !!episode;

  // Form setup with dynamic schema
  const form = useForm<EpisodeFormData>({
    resolver: zodResolver(createEpisodeFormSchema(isUpdate)),
    defaultValues: {
      animeId: episode?.anime?.id || episode?.animeId || 0,
      animeTitle: episode?.anime?.title || episode?.animeTitle || "",
      episodeNumber: episode?.episodeNumber || 1,
      title: episode?.title || "",
      thumbnailType: episode?.thumbnail ? "url" : "upload",
      thumbnailUrl: episode?.thumbnail || "",
      videoSourceType: episode?.masterUrl && !episode?.sourceFile ? "url" : "upload",
      masterUrl: episode?.masterUrl || "",
      duration: episode?.duration || 0,
      description: episode?.description || "",
      airDate: episode?.airDate ? new Date(episode.airDate) : new Date(),
      isDeleted: episode?.isDeleted || false,
      commentsEnabled: episode?.commentsEnabled ?? true,
      loginRequired: episode?.loginRequired || false,
      isFiller: episode?.isFiller || false,
    },
  });


  // ... keep existing code (state variables and initial setup)

  const handleAnimeSelect = (anime: AnimeOption) => {
    form.setValue("animeId", anime.id);
    form.setValue("animeTitle", anime.title);
  };

  const handleAnimeClear = () => {
    form.setValue("animeId", 0);
    form.setValue("animeTitle", "");
  };

  const handleDeleteImage = async () => {
    if (!episode?.id || !episode?.thumbnail) return;

    setDeleteImageLoading(true);
    try {
      const isDbImage = episode.thumbnail.includes("/uploads/");

      const response = await episodeService.deleteImage(episode.id, episode.thumbnail, isDbImage);

      if (response.data.success) {
        setThumbnailPreview(null);
        form.setValue("thumbnailUrl", "");
        toast({
          id: Math.random().toString(),
          title: "Success",
          description: "Episode thumbnail deleted successfully",
        });
      }
    } catch (error: any) {
      toast({
        id: Math.random().toString(),
        title: "Error",
        description: error.response?.data?.message || "Failed to delete image",
      });
    } finally {
      setDeleteImageLoading(false);
    }
  };

  const handleSubmit = async (data: EpisodeFormData) => {
    try {
      // Check for duplicate episode before uploading
      // Only check if creating NEW (no episode object) or if updating and changing the episode number
      // We use !episode for new creation check because 'creating' prop is just a loading state
      if (!episode || (episode && data.episodeNumber !== episode.episodeNumber)) {
        try {
          const check = await episodeService.checkEpisodeAvailability(data.animeId, data.episodeNumber);
          if (check.data.exists) {
            toast({
              title: "Error",
              description: `Episode ${data.episodeNumber} already exists for this anime.`,
              // variant: "destructive",
            });
            return; // Stop submission
          }
        } catch (checkError) {
          console.error("Failed to check episode availability", checkError);
          // If check fails (e.g. network error), maybe we should warn user or stop?
          // For now, let's proceed but warn console, or maybe stop to be safe.
          // User wants to strictly prevent it.
          // But if backend is down, the next call will fail anyway.
        }
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting episode form:', error);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
          {/* Anime Selection */}
          <FormField
            control={form.control}
            name="animeId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium">
                  Anime <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <AnimeSearchInput
                    value={field.value}
                    selectedTitle={form.getValues("animeTitle")}
                    onSelect={handleAnimeSelect}
                    onClear={handleAnimeClear}
                    placeholder="Search and select anime..."
                  />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  Search and select the anime this episode belongs to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Anime Title (Hidden/Disabled) */}
          <FormField
            control={form.control}
            name="animeTitle"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Episode Number and Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="episodeNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Episode Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Episode Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Episode 1: First Mission" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Thumbnail Settings */}
          <FormField
            control={form.control}
            name="thumbnailType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Thumbnail <span className="text-red-500">*</span>
                </FormLabel>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.value === "upload"}
                    onCheckedChange={(checked) => {
                      const newType = checked ? "upload" : "url";
                      field.onChange(newType);
                      // Clear opposite field when switching
                      if (newType === "upload") {
                        form.setValue("thumbnailUrl", "");
                      } else {
                        form.setValue("thumbnailFile", undefined);
                        setThumbnailPreview(null);
                      }
                    }}
                  />
                  <span className="text-sm">
                    {field.value === "upload" ? "Upload File" : "Use URL"}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail URL or File Upload */}
          {form.watch("thumbnailType") === "url" ? (
            <FormField
              control={form.control}
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/thumbnail.jpg"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setThumbnailPreview(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="thumbnailFile"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Thumbnail File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setThumbnailPreview(url);
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Thumbnail Preview */}
          {thumbnailPreview && (
            <div className="mt-2 relative inline-block">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-32 h-20 object-cover rounded-md border"
              />
              {episode?.id && episode?.thumbnail && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      disabled={deleteImageLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Thumbnail</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this thumbnail? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteImage} disabled={deleteImageLoading}>
                        {deleteImageLoading ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}

          {/* Video Source */}
          {/* Current Video Info (Only on Update) */}
          {isUpdate && episode?.masterUrl && (
            <div className="bg-muted/30 p-3 rounded-md border border-dashed text-xs space-y-1">
              <p className="font-semibold text-muted-foreground flex items-center gap-1">
                🎥 Current Video Status:
              </p>
              <code className="block p-1 bg-background rounded truncate">
                {episode.masterUrl}
              </code>
              {episode.masterUrl === "PROCESSING" && (
                <p className="text-amber-500 animate-pulse font-medium">
                  ⚠️ Video is currently being processed...
                </p>
              )}
            </div>
          )}

          <FormField
            control={form.control}
            name="videoSourceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Video Source Selection <span className="text-red-500">*</span></FormLabel>
                <div className="flex items-center space-x-3 bg-secondary/20 p-2 rounded-md w-fit">
                  <span className={cn("text-xs transition-colors", field.value === "upload" ? "text-primary font-bold" : "text-muted-foreground")}>
                    Upload File
                  </span>
                  <Switch
                    checked={field.value === "url"}
                    onCheckedChange={(checked) => {
                      const newType = checked ? "url" : "upload";
                      field.onChange(newType);
                      // Clear opposite field when switching
                      if (newType === "upload") {
                        form.setValue("masterUrl", "");
                      } else {
                        form.setValue("sourceFile", undefined);
                      }
                    }}
                  />
                  <span className={cn("text-xs transition-colors", field.value === "url" ? "text-primary font-bold" : "text-muted-foreground")}>
                    Paste URL / m3u8
                  </span>
                </div>
                <FormDescription className="text-xs">
                  {field.value === "url"
                    ? "Paste a direct .m3u8 link or a local path."
                    : "Upload a raw video file for server-side transcoding."}
                </FormDescription>
              </FormItem>
            )}
          />

          {form.watch("videoSourceType") === "url" ? (
            <FormField
              control={form.control}
              name="masterUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Master URL / m3u8 Path</FormLabel>
                  <FormControl>
                    <Input placeholder="eg: /uploads/Anime/ep1/master.m3u8 or https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="sourceFile"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Upload Source Video</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Max file size based on server limits (standard 15Gb for content).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Duration */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DurationInput
                    value={field.value}
                    onChange={field.onChange}
                    label="Duration"
                    required
                  />
                </FormControl>
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
                <FormLabel className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Episode description..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Air Date */}
          <FormField
            control={form.control}
            name="airDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium">
                  Air Date <span className="text-red-500">*</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Episode Settings</h3>

            <FormField
              control={form.control}
              name="commentsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Comments Enabled <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      Allow users to comment on this episode
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loginRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Login Required <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      Require users to be logged in to watch this episode
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFiller"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Filler Episode
                    </FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      Mark this episode as filler content (non-canon)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDeleted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Soft Delete <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      Mark this episode as deleted (only visible to admins)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {creating && uploadProgress > 0 && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Uploading Video...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Button type="submit" disabled={creating} className="w-full">
            {creating ? "Creating Episode..." : episode ? "Update Episode" : "Create Episode"}
          </Button>
        </form>
      </Form>
    </div>
  );
}