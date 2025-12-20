import { contentApi } from "./backendApi";

export interface OptionsData {
  AnimeStatus: string[];
  MediaType: string[];
  Season: string[];
  [key: string]: string[];
}

export interface OptionsResponse {
  statusCode: number;
  data: OptionsData;
  message: string;
  success: boolean;
}

export interface AddOptionPayload {
  category: string;
  value: string;
}

export interface DeleteOptionPayload {
  category: string;
  value: string;
}

export interface OptionActionResponse {
  statusCode: number;
  data: null;
  message: string;
  success: boolean;
}

export const optionsService = {
  // Get all options
  getOptions: async (): Promise<OptionsResponse> => {
    const response = await contentApi.get<OptionsResponse>('/api/options');
    return response.data;
  },

  // Add new option
  addOption: async (payload: AddOptionPayload): Promise<OptionActionResponse> => {
    const response = await contentApi.post<OptionActionResponse>('/api/options', payload);
    return response.data;
  },

  // Delete option
  deleteOption: async (payload: DeleteOptionPayload): Promise<OptionActionResponse> => {
    const response = await contentApi.delete<OptionActionResponse>('/api/options', { data: payload });
    return response.data;
  },
};
