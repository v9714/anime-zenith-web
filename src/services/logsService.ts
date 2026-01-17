import { contentApi } from "./backendApi";

export interface LogFile {
  name: string;
  type: "LOG" | "METRIC";
  size: string;
  mtime: string;
}

export interface LogFilesResponse {
  success: boolean;
  statusCode: number;
  data: LogFile[];
  message: string;
}

export interface LogContentResponse {
  success: boolean;
  statusCode: number;
  data: {
    content: string;
    truncated: boolean;
  };
  message: string;
}

export interface DeleteLogResponse {
  success: boolean;
  statusCode: number;
  data: null;
  message: string;
}

export interface HealthMetric {
  timestamp: string;
  service: string;
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
}

export const logsService = {
  getLogFiles: async (): Promise<LogFilesResponse> => {
    const response = await contentApi.get<LogFilesResponse>('/api/admin/logs/');
    return response.data;
  },

  getLogContent: async (filename: string): Promise<LogContentResponse> => {
    const response = await contentApi.get<LogContentResponse>(`/api/admin/logs/${filename}`);
    return response.data;
  },

  deleteLogFile: async (filename: string): Promise<DeleteLogResponse> => {
    const response = await contentApi.delete<DeleteLogResponse>(`/api/admin/logs/${filename}`);
    return response.data;
  },

  parseHealthMetrics: (content: string): HealthMetric[] => {
    const lines = content.trim().split('\n').filter(line => line.trim());
    const metrics: HealthMetric[] = [];
    
    for (const line of lines) {
      try {
        const metric = JSON.parse(line) as HealthMetric;
        metrics.push(metric);
      } catch {
        // Skip invalid lines
      }
    }
    
    return metrics;
  },
};
