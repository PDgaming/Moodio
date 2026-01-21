interface ApiError {
  error: string;
  code: string;
  details?: Record<string, any>;
}
