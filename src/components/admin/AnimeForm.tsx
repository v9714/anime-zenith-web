
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
import { Anime } from "@/services/api";

const animeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  title_english: z.string().optional(),
  title_japanese: z.string().optional(),
  synopsis: z.string().min(1, "Synopsis is required"),
  type: z.string().min(1, "Type is required"),
  episodes: z.coerce.number().min(1, "Episodes must be at least 1"),
  status: z.string().min(1, "Status is required"),
  airing: z.boolean().default(false),
  score: z.coerce.number().min(0).max(10).optional(),
  rating: z.string().optional(),
  image_url: z.string().url("Please enter a valid URL").min(1, "Image URL is required"),
  trailer_url: z.string().url("Please enter a valid URL").optional(),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 5),
  season: z.string().optional(),
});

type AnimeFormValues = z.infer<typeof animeFormSchema>;

interface AnimeFormProps {
  anime?: Anime;
  onSubmit: (data: Anime) => void;
}

export function AnimeForm({ anime, onSubmit }: AnimeFormProps) {
  const form = useForm<AnimeFormValues>({
    resolver: zodResolver(animeFormSchema),
    defaultValues: anime ? {
      title: anime.title,
      title_english: anime.title_english,
      title_japanese: anime.title_japanese,
      synopsis: anime.synopsis,
      type: anime.type,
      episodes: anime.episodes,
      status: anime.status,
      airing: anime.airing,
      score: anime.score,
      rating: anime.rating,
      image_url: anime.images.jpg.image_url,
      trailer_url: anime.trailer?.url,
      year: anime.year,
      season: anime.season,
    } : {
      title: "",
      title_english: "",
      title_japanese: "",
      synopsis: "",
      type: "TV",
      episodes: 1,
      status: "Not yet aired",
      airing: false,
      score: undefined,
      rating: "",
      image_url: "",
      trailer_url: "",
      year: new Date().getFullYear(),
      season: "winter",
    },
  });

  const handleSubmit = (data: AnimeFormValues) => {
    // Transform the form data into the Anime format
    const newAnime: Anime = {
      mal_id: anime?.mal_id || Math.floor(Math.random() * 10000),
      title: data.title,
      title_english: data.title_english || data.title,
      title_japanese: data.title_japanese || "",
      images: {
        jpg: {
          image_url: data.image_url,
          small_image_url: data.image_url,
          large_image_url: data.image_url,
        },
        webp: {
          image_url: data.image_url,
          small_image_url: data.image_url,
          large_image_url: data.image_url,
        }
      },
      type: data.type,
      episodes: data.episodes,
      status: data.status,
      airing: data.airing,
      synopsis: data.synopsis,
      score: data.score || 0,
      genres: anime?.genres || [],
      rating: data.rating || "",
      aired: {
        from: anime?.aired?.from || new Date().toISOString(),
        to: anime?.aired?.to || new Date().toISOString(),
      },
      season: data.season || "winter",
      year: data.year,
      duration: anime?.duration || "24 min per ep",
      trailer: {
        youtube_id: data.trailer_url?.split("v=")[1] || "",
        url: data.trailer_url || "",
      },
    };

    onSubmit(newAnime);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            name="title_english"
            render={({ field }) => (
              <FormItem>
                <FormLabel>English Title (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter English title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title_japanese"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Japanese Title (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter Japanese title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="synopsis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Synopsis</FormLabel>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input placeholder="TV, Movie, OVA, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="episodes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Episodes</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
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
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Input placeholder="Airing, Completed, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Score (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="10" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input type="number" min="1900" max={new Date().getFullYear() + 5} {...field} />
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
                <FormControl>
                  <Input placeholder="winter, spring, summer, fall" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trailer_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trailer URL (optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://youtube.com/watch?v=..." {...field} />
              </FormControl>
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
