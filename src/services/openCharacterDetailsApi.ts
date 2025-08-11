import axios from 'axios';
import { OPEN_CHAR_API_BASE_URL } from '@/utils/constants';
import type { JikanCharacterImage } from '@/services/openCharacterApi';

export interface JikanCharacterFull {
  name?: string;
  name_kanji?: string;
  about?: string;
  favorites?: number;
  nicknames?: string[];
  images?: JikanCharacterImage;
}

interface JikanCharacterFullResponse {
  data: JikanCharacterFull;
}

const client = axios.create({ baseURL: OPEN_CHAR_API_BASE_URL, timeout: 12000 });

export async function getCharacterDetailsById(id: number): Promise<JikanCharacterFull | null> {
  try {
    const res = await client.get<JikanCharacterFullResponse>(`/characters/${id}/full`);
    return res.data.data ?? null;
  } catch (e) {
    console.error('Jikan character full error', e);
    return null;
  }
}
