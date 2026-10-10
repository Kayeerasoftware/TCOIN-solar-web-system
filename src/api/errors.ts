import { AxiosError } from 'axios';

/** RFC 9457 problem details as returned by the API (see openapi.yaml, Problem). */
export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  code: string;
  detail?: string;
  errors?: { field: string; message: string }[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string>;
  constructor(p: ProblemDetails) {
    super(p.detail ?? p.title);
    this.name = 'ApiError';
    this.status = p.status;
    this.code = p.code;
    this.fieldErrors = Object.fromEntries((p.errors ?? []).map((e) => [e.field, e.message]));
  }
  get isValidation() { return this.status === 422; }
  get isConflict() { return this.status === 409; }
  get isNotPermitted() { return this.status === 403; }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof AxiosError) {
    const data = error.response?.data as Partial<ProblemDetails> | undefined;
    if (data?.code) return new ApiError({ title: data.title ?? error.message, status: error.response?.status ?? 0, code: data.code, detail: data.detail, errors: data.errors });
    if (!error.response) return new ApiError({ title: 'Cannot reach the server', status: 0, code: 'network_error' });
    return new ApiError({ title: error.message, status: error.response.status, code: 'http_' + error.response.status });
  }
  return new ApiError({ title: error instanceof Error ? error.message : 'Unknown error', status: 0, code: 'unknown' });
}
