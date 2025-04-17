
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

// Define the Episode interface
interface Episode {
  id: number;
  animeId: number;
  animeTitle: string;
  episodeNumber: number;
  title: string;
  thumbnailUrl: string;
  duration: number;
  airedDate: string;
}

const episodeFormSchema = z.object({
  animeId: z.coerce.number().min(1, "Anime ID is required"),
  animeTitle: z.string().min(1, "Anime title is required"),
  episodeNumber: z.coerce.number().min(1, "Episode number is required"),
  title: z.string().min(1, "Title is required"),
  thumbnailUrl: z.string().url("Please enter a valid URL").min(1, "Thumbnail URL is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  airedDate: z.string().min(1, "Aired date is required"),
});

type EpisodeFormValues = z.infer<typeof episodeFormSchema>;

interface EpisodeFormProps {
  episode?: Episode;
  onSubmit: (data: Episode) => void;
}

export function EpisodeForm({ episode, onSubmit }: EpisodeFormProps) {
  const form = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeFormSchema),
    defaultValues: episode ? {
      animeId: episode.animeId,
      animeTitle: episode.animeTitle,
      episodeNumber: episode.episodeNumber,
      title: episode.title,
      thumbnailUrl: episode.thumbnailUrl,
      duration: episode.duration,
      airedDate: episode.airedDate,
    } : {
      animeId: 0,
      animeTitle: "",
      episodeNumber: 1,
      title: "",
      thumbnailUrl: "",
      duration: 24,
      airedDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = (data: EpisodeFormValues) => {
    // Transform the form data into the Episode format
    const newEpisode: Episode = {
      id: episode?.id || Math.floor(Math.random() * 10000),
      ...data
    };

    onSubmit(newEpisode);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="animeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anime ID</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="animeTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anime Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter anime title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="episodeNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Episode Number</FormLabel>
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
                <FormLabel>Episode Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter episode title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="airedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aired Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
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
