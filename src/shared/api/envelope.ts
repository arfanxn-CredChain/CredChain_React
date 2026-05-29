/**
 * Backend response envelope: { code, message, data?, errors? }
 */

import type { AxiosError } from "axios";

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface ApiErrorResponse {
  code: number;
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public readonly status: number | undefined;
  public readonly code: number | undefined;
  public readonly messageKey: string;
  public readonly fieldErrors: Record<string, string[]> | undefined;
  public readonly cause: AxiosError<ApiErrorResponse>;

  constructor(
    status: number | undefined,
    code: number | undefined,
    messageKey: string,
    cause: AxiosError<ApiErrorResponse>,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(messageKey);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.messageKey = messageKey;
    this.fieldErrors = fieldErrors;
    this.cause = cause;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
