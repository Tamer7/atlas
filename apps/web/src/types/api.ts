export interface ApiResponse<T = unknown> {
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
