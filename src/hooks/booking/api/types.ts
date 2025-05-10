
export type RequestPriority = 'high' | 'medium' | 'low';

export interface FetchDataOptions {
  type: string;
  professionalId: string;
  ttl?: number;
  signal?: AbortSignal;
  priority?: RequestPriority;
  useStorageCache?: boolean;
  skipQueue?: boolean;
}
