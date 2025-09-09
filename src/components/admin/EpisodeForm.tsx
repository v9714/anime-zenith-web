import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { AnimeSearchInput } from "./AnimeSearchInput";
import { type Episode } from "@/services/episodeService";

// Schema for form validation
const episodeFormSchema = z.object({
  animeId: z.number().min(1, "Please select an anime"),
  animeTitle: z.string().min(1, "Anime title is required"),
  episodeNumber: z.coerce.number().min(1, "Episode number must be at least 1"),
  title: z.string().min(1, "Episode title is required"),
  thumbnailType: z.enum(["url", "upload"]),
  thumbnailUrl: z.string().optional(),
  thumbnailFile: z.any().optional(),
  masterUrl: z.string().min(1, "Master URL is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 second"),
  description: z.string().min(1, "Description is required"),
  airDate: z.date(),
  isDeleted: z.boolean().default(false),
  commentsEnabled: z.boolean().default(true),
  loginRequired: z.boolean().default(false),
  sourceFile: z.any().optional(),
}).refine((data) => {
  if (data.thumbnailType === "url") {
    return data.thumbnailUrl && data.thumbnailUrl.length > 0;
  } else {
    return data.thumbnailFile;
  }
}, {
  message: "Please provide either a thumbnail URL or upload a thumbnail file",
  path: ["thumbnailUrl"],
});

type EpisodeFormData = z.infer<typeof episodeFormSchema>;

interface AnimeOption {
  id: number;
  title: string;
}

interface EpisodeFormProps {
  episode?: Episode;
  onSubmit: (data: EpisodeFormData) => void;
}

export function EpisodeForm({ episode, onSubmit }: EpisodeFormProps) {

  // Form setup with react-hook-form
  const form = useForm<EpisodeFormData>({
    resolver: zodResolver(episodeFormSchema),
    defaultValues: {
      animeId: episode?.animeId || 0,
      animeTitle: episode?.animeTitle || "",
      episodeNumber: episode?.episodeNumber || 1,
      title: episode?.title || "",
      thumbnailType: "url",
      thumbnailUrl: episode?.thumbnail || "",
      masterUrl: episode?.masterUrl || "",
      duration: episode?.duration || 0,
      description: episode?.description || "",
      airDate: episode?.airDate ? new Date(episode.airDate) : new Date(),
      isDeleted: episode?.isDeleted || false,
      commentsEnabled: episode?.commentsEnabled ?? true,
      loginRequired: episode?.loginRequired || false,
    },
  });


  // Update masterUrl when sourceFile is selected
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "sourceFile" && value.sourceFile) {
        form.setValue("masterUrl", "Pending, not uploaded");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleAnimeSelect = (anime: AnimeOption) => {
    form.setValue("animeId", anime.id);
    form.setValue("animeTitle", anime.title);
  };

  const handleSubmit = async (data: EpisodeFormData) => {
    try {
      onSubmit(data);
    } catch (error) {
      console.error('Error submitting episode form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Anime Selection */}
        <FormField
          control={form.control}
          name="animeId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Anime</FormLabel>
              <FormControl>
                <AnimeSearchInput
                  value={field.value}
                  selectedTitle={form.getValues("animeTitle")}
                  onSelect={handleAnimeSelect}
                  placeholder="Search and select anime..."
                />
              </FormControl>
              <FormDescription>
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
                <FormLabel>Episode Number</FormLabel>
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
                <FormLabel>Episode Title</FormLabel>
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
              <FormLabel>Thumbnail</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="url"
                      checked={field.value === "url"}
                      onChange={() => field.onChange("url")}
                    />
                    <span>URL</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="upload"
                      checked={field.value === "upload"}
                      onChange={() => field.onChange("upload")}
                    />
                    <span>Upload File</span>
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thumbnail URL (when URL is selected) */}
        {form.watch("thumbnailType") === "url" && (
          <FormField
            control={form.control}
            name="thumbnailUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Thumbnail File Upload (when Upload is selected) */}
        {form.watch("thumbnailType") === "upload" && (
          <FormField
            control={form.control}
            name="thumbnailFile"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Thumbnail File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Master URL and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="masterUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Master URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/video.mp4" {...field} />
                </FormControl>
                <FormDescription>
                  Video URL (will be "Pending" if source file is uploaded)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (seconds)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1400" {...field} />
                </FormControl>
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
              <FormLabel>Air Date</FormLabel>
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
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Source File Upload (Optional) */}
        <FormField
          control={form.control}
          name="sourceFile"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Source File (Optional)</FormLabel>
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
              <FormDescription>
                Upload the original video file (will set Master URL to "Pending")
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checkboxes */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="commentsEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Comments Enabled</FormLabel>
                  <FormDescription>
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
                  <FormLabel className="text-base">Login Required</FormLabel>
                  <FormDescription>
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
            name="isDeleted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Soft Delete</FormLabel>
                  <FormDescription>
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

        <Button type="submit" className="w-full">
          {episode ? "Update Episode" : "Create Episode"}
        </Button>
      </form>
    </Form>
  );
}