import type { Role } from "@shared/auth/role";

export type Gender = "male" | "female" | "other";

/**
 * Mirrors backend response.User from infrastructure/http/response/user.go
 */
export interface UserDTO {
  id: string;
  name: string | null;
  number: string | null;
  phone_number: string | null;
  email: string;
  birth_date: string | null;
  gender: Gender | null;
  role: Role;
  meta: Record<string, unknown> | null;
  wallet_address: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Mirrors backend response.Auth (User embedded inline + token fields).
 * Tokens are present in body but ignored when using httpOnly cookie strategy.
 */
export interface AuthResponseDTO extends UserDTO {
  access_token: string;
  refresh_token: string;
  access_token_expires_in: number;
  refresh_token_expires_in: number;
  token_type: "Bearer";
}

/**
 * Mirrors backend response.Credential
 */
export interface CredentialDTO {
  id: string;
  holder_id: string;
  issuer_id: string;
  hash: string;
  uri: string;
  title: string;
  description: string;
  type: string;
  issued_at: string;
  valid_until: string | null;
  revoked: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Paginated response shape from list endpoints.
 * Mirrors backend response.Pagination from infrastructure/http/response/pagination.go.
 * Backend exposes more URL helpers; we only declare the fields we consume.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
  from: number;
  to: number;
  first_page_url: string | null;
  last_page_url: string | null;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}
