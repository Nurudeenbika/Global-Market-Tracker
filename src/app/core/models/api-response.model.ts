export interface ApiResponse<T> {
  data: T;
  status?: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface ApiError {
  status: number;
  message: string;
  details?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
  lastUpdated: number | null;
}

export function createInitialAsyncState<T>(): AsyncState<T> {
  return {
    data: null,
    loading: 'idle',
    error: null,
    lastUpdated: null,
  };
}
