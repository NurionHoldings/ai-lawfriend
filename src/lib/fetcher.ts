export type ApiSuccess<T> = {
  success: true;
  data: T;
  error: null;
};

export type ApiFailure = {
  success: false;
  data: null;
  error: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export async function parseApiResponse<T>(
  res: Response
): Promise<ApiResponse<T>> {
  const json = await res.json();
  return json as ApiResponse<T>;
}
