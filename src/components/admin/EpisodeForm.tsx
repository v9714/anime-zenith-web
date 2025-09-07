
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Upload } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the Episode interface
interface Episode {
  id?: number;
  animeId: number;
  animeTitle: string;
  episodeNumber: number;
  title: string;
  thumbnailType: "url" | "upload";
  thumbnailUrl?: string;
  thumbnailFile?: File;
  masterUrl: string;
  duration: number;
  description: string;
  airDate: Date;
  isDeleted: boolean;
  commentsEnabled: boolean;
  loginRequired: boolean;
  sourceFile?: File;
}

interface AnimeOption {
  id: number;
  title: string;
}

const episodeFormSchema = z.object({
  animeId: z.coerce.number().min(1, "Anime selection is required"),
  animeTitle: z.string().min(1, "Anime title is required"),
  episodeNumber: z.coerce.number().min(1, "Episode number is required"),
  title: z.string().min(1, "Episode title is required"),
  thumbnailType: z.enum(["url", "upload"]).default("url"),
  thumbnailUrl: z.string().optional(),
  thumbnailFile: z.any().optional(),
  masterUrl: z.string().min(1, "Master URL is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  airDate: z.date({
    required_error: "Air date is required",
  }),
  isDeleted: z.boolean().default(false),
  commentsEnabled: z.boolean().default(true),
  loginRequired: z.boolean().default(false),
  sourceFile: z.any().optional(),
}).refine((data) => {
  if (data.thumbnailType === "url" && !data.thumbnailUrl) {
    return false;
  }
  if (data.thumbnailType === "upload" && !data.thumbnailFile) {
    return false;
  }
  return true;
}, {
  message: "Thumbnail is required - either URL or file upload",
  path: ["thumbnailUrl"],
});

type EpisodeFormValues = z.infer<typeof episodeFormSchema>;

interface EpisodeFormProps {
  episode?: Episode;
  onSubmit: (data: Episode) => void;
}

export function EpisodeForm({ episode, onSubmit }: EpisodeFormProps) {
  const [animeOptions, setAnimeOptions] = useState<AnimeOption[]>([]);
  const [isAnimeOpen, setIsAnimeOpen] = useState(false);
  const [isLoadingAnime, setIsLoadingAnime] = useState(false);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const sourceFileRef = useRef<HTMLInputElement>(null);

  const form = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeFormSchema),
    defaultValues: episode ? {
      animeId: episode.animeId,
      animeTitle: episode.animeTitle,
      episodeNumber: episode.episodeNumber,
      title: episode.title,
      thumbnailType: episode.thumbnailType || "url",
      thumbnailUrl: episode.thumbnailUrl,
      masterUrl: episode.masterUrl,
      duration: episode.duration,
      description: episode.description,
      airDate: episode.airDate,
      isDeleted: episode.isDeleted,
      commentsEnabled: episode.commentsEnabled,
      loginRequired: episode.loginRequired,
    } : {
      animeId: 0,
      animeTitle: "",
      episodeNumber: 1,
      title: "",
      thumbnailType: "url" as const,
      thumbnailUrl: "",
      masterUrl: "",
      duration: 24,
      description: "",
      airDate: new Date(),
      isDeleted: false,
      commentsEnabled: true,
      loginRequired: false,
    },
  });

  const thumbnailType = form.watch("thumbnailType");
  const sourceFile = form.watch("sourceFile");

  // Fetch anime list on component mount
  useEffect(() => {
    const fetchAnimeOptions = async () => {
      setIsLoadingAnime(true);
      try {
        const response = await fetch("http://localhost:8081/api/anime");
        if (response.ok) {
          const animeList = await response.json();
          setAnimeOptions(animeList.map((anime: any) => ({
            id: anime.id,
            title: anime.title
          })));
        }
      } catch (error) {
        console.error("Failed to fetch anime options:", error);
      } finally {
        setIsLoadingAnime(false);
      }
    };

    fetchAnimeOptions();
  }, []);

  // Update masterUrl when sourceFile changes
  useEffect(() => {
    if (sourceFile) {
      form.setValue("masterUrl", "Pending, not uploaded");
    }
  }, [sourceFile, form]);

  const handleAnimeSelect = (animeId: number) => {
    const selectedAnime = animeOptions.find(anime => anime.id === animeId);
    if (selectedAnime) {
      form.setValue("animeId", animeId);
      form.setValue("animeTitle", selectedAnime.title);
    }
    setIsAnimeOpen(false);
  };

  const handleSubmit = async (data: EpisodeFormValues) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all form fields
      formData.append('animeId', data.animeId.toString());
      formData.append('animeTitle', data.animeTitle);
      formData.append('episodeNumber', data.episodeNumber.toString());
      formData.append('title', data.title);
      formData.append('thumbnailType', data.thumbnailType);
      formData.append('masterUrl', data.masterUrl);
      formData.append('duration', data.duration.toString());
      formData.append('description', data.description);
      formData.append('airDate', data.airDate.toISOString());
      formData.append('isDeleted', data.isDeleted.toString());
      formData.append('commentsEnabled', data.commentsEnabled.toString());
      formData.append('loginRequired', data.loginRequired.toString());

      // Add files if they exist
      if (data.thumbnailType === 'upload' && data.thumbnailFile) {
        formData.append('thumbnailFile', data.thumbnailFile);
      } else if (data.thumbnailType === 'url' && data.thumbnailUrl) {
        formData.append('thumbnailUrl', data.thumbnailUrl);
      }

      if (data.sourceFile) {
        formData.append('sourceFile', data.sourceFile);
      }

      // API call
      const url = episode?.id 
        ? `http://localhost:8081/api/episode/${episode.id}`
        : 'http://localhost:8081/api/episode';
      
      const method = episode?.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${episode?.id ? 'update' : 'add'} episode`);
      }

      const result = await response.json();
      
      // Transform response back to Episode format for UI update
      const episodeResult: Episode = {
        id: result.id || episode?.id,
        animeId: result.animeId,
        animeTitle: result.animeTitle,
        episodeNumber: result.episodeNumber,
        title: result.title,
        thumbnailType: result.thumbnailType,
        thumbnailUrl: result.thumbnailUrl,
        thumbnailFile: data.thumbnailFile,
        masterUrl: result.masterUrl,
        duration: result.duration,
        description: result.description,
        airDate: new Date(result.airDate),
        isDeleted: result.isDeleted,
        commentsEnabled: result.commentsEnabled,
        loginRequired: result.loginRequired,
        sourceFile: data.sourceFile,
      };

      onSubmit(episodeResult);
    } catch (error) {
      console.error('Error submitting episode:', error);
      // You might want to show a toast notification here
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Anime Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="animeId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Select Anime <span className="text-red-500">*</span></FormLabel>
                <Popover open={isAnimeOpen} onOpenChange={setIsAnimeOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? animeOptions.find((anime) => anime.id === field.value)?.title
                          : "Select anime..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search anime..." />
                      <CommandList>
                        <CommandEmpty>
                          {isLoadingAnime ? "Loading..." : "No anime found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {animeOptions.map((anime) => (
                            <CommandItem
                              value={anime.title}
                              key={anime.id}
                              onSelect={() => handleAnimeSelect(anime.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  anime.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {anime.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="animeTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anime Title <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} disabled placeholder="Auto-filled from selection" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Episode Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="episodeNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Episode Number <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
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
                <FormLabel>Episode Title <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Episode 2: Second Mission" {...field} />
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
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Thumbnail Source</FormLabel>
                <FormDescription>
                  Choose between URL or file upload for thumbnail
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === "upload"}
                  onCheckedChange={(checked) => {
                    field.onChange(checked ? "upload" : "url");
                    // Clear the other field when switching
                    if (checked) {
                      form.setValue("thumbnailUrl", "");
                    } else {
                      form.setValue("thumbnailFile", undefined);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {thumbnailType === "url" ? (
          <FormField
            control={form.control}
            name="thumbnailUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="thumbnailFile"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Thumbnail File <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => thumbnailFileRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {form.watch("thumbnailFile") ? "Change Thumbnail" : "Upload Thumbnail"}
                    </Button>
                    <input
                      type="file"
                      ref={thumbnailFileRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </FormControl>
                {form.watch("thumbnailFile") && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {form.watch("thumbnailFile").name}
                  </p>
                )}
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
                <FormLabel>Master URL <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder={sourceFile ? "Pending, not uploaded" : "Video stream URL"}
                    disabled={!!sourceFile}
                    value={sourceFile ? "Pending, not uploaded" : field.value}
                  />
                </FormControl>
                <FormDescription>
                  {sourceFile ? "Will be set after file processing" : "URL to the video file"}
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
                <FormLabel>Duration (minutes) <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    step="0.1"
                    placeholder="24"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Duration in minutes (e.g., 24 or 23.5)
                </FormDescription>
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
              <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="This is the second episode of the anime..."
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
              <FormLabel>Air Date <span className="text-red-500">*</span></FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Source File Upload */}
        <FormField
          control={form.control}
          name="sourceFile"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Source File (Optional)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => sourceFileRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {form.watch("sourceFile") ? "Change Source File" : "Upload Source File"}
                  </Button>
                  <input
                    type="file"
                    ref={sourceFileRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(file);
                      }
                    }}
                    accept="video/*"
                    className="hidden"
                  />
                </div>
              </FormControl>
              {form.watch("sourceFile") && (
                <p className="text-sm text-muted-foreground">
                  Selected: {form.watch("sourceFile").name}
                </p>
              )}
              <FormDescription>
                Upload original video file (admin only)
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable Comments</FormLabel>
                  <FormDescription>
                    Allow users to comment on this episode
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loginRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Login Required</FormLabel>
                  <FormDescription>
                    Users must login to watch this episode
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isDeleted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Soft Delete (Admin Only)</FormLabel>
                  <FormDescription>
                    Hide episode from users but keep visible to admin
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">
            {episode ? "Update Episode" : "Add Episode"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
