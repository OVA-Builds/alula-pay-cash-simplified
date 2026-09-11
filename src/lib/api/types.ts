// Shared shape for every backend call in src/lib/api/*. A real fetch()
// to a real endpoint returns exactly this same shape once these are
// wired up for real — every caller already awaits a Promise<ApiResult<T>>,
// so swapping the mock body for a real request changes nothing downstream.
export type ApiError = { code: string; message: string };

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };
