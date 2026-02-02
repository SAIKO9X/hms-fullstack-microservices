export interface ErrorDetails {
  code: number;
  type?: string;
  validationErrors?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
  error?: ErrorDetails;
}
