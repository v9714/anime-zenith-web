import axios from 'axios';
import { OPEN_CHAR_API_BASE_URL } from '@/utils/constants';

// Interfaces for Open Characters API (Jikan)
export interface JikanCharacterImage {
  jpg?: { image_url?: string };
  webp?: { image_url?: string };
}

export interface JikanCharacterEntry {
  character: {
    mal_id: number;
    url: string;
    images?: JikanCharacterImage;
    name: string;
  };
  role?: string;
  favorites?: number;
}

export interface JikanCharactersResponse {
  data: JikanCharacterEntry[];
}

export interface JikanAnimeSearchItem {
  mal_id: number;
  title: string;
}

export interface JikanAnimeSearchResponse {
  data: JikanAnimeSearchItem[];
}

const client = axios.create({ baseURL: OPEN_CHAR_API_BASE_URL, timeout: 12000 });

export async function searchAnimeByTitle(title: string): Promise<JikanAnimeSearchItem | null> {
  try {
    const res = await client.get<JikanAnimeSearchResponse>(`/anime`, { params: { q: title, limit: 5 } });
    return res.data.data?.[0] ?? null;
  } catch (e) {
    console.error('Jikan search error', e);
    return null;
  }
}

export async function getCharactersByAnimeMalId(malId: number): Promise<JikanCharacterEntry[]> {
  try {
    const res = await client.get<JikanCharactersResponse>(`/anime/${malId}/characters`);
    return res.data.data ?? [];
  } catch (e) {
    console.error('Jikan characters error', e);
    return [];
  }
}
