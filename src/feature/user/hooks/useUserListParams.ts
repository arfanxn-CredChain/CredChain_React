import { useSearchParams } from "react-router-dom";
import { Role } from "@shared/auth/role";

export type RoleFilter = "all" | Role;

export interface UserListParams {
  page: number;
  search: string;
  sort: string;
  status: "all" | "deleted_at_" | "deleted_at!_";
  role: RoleFilter;
  limit: number;
}

const DEFAULTS: UserListParams = {
  page: 1,
  search: "",
  sort: "-updated_at",
  status: "all",
  role: "all",
  limit: 10,
};

const ALLOWED_LIMITS = [10, 20, 50, 100] as const;

const PAGE_RESET_KEYS: (keyof UserListParams)[] = [
  "search",
  "sort",
  "status",
  "role",
  "limit",
];

function parsePage(raw: string | null): number {
  const n = parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function parseLimit(raw: string | null): number {
  const n = parseInt(raw ?? String(DEFAULTS.limit), 10);
  return (ALLOWED_LIMITS as readonly number[]).includes(n) ? n : DEFAULTS.limit;
}

function parseStatus(raw: string | null): "all" | "deleted_at_" | "deleted_at!_" {
  if (raw === "deleted_at_" || raw === "deleted_at!_") return raw;
  return "all";
}

function parseRole(raw: string | null): RoleFilter {
  if (
    raw === Role.SUPER_ADMIN ||
    raw === Role.ADMIN ||
    raw === Role.ISSUER ||
    raw === Role.HOLDER
  ) {
    return raw;
  }
  return "all";
}

export function useUserListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: UserListParams = {
    page: parsePage(searchParams.get("page")),
    search: searchParams.get("search") ?? DEFAULTS.search,
    sort: searchParams.get("sort") ?? DEFAULTS.sort,
    status: parseStatus(searchParams.get("status")),
    role: parseRole(searchParams.get("role")),
    limit: parseLimit(searchParams.get("limit")),
  };

  function setParam<K extends keyof UserListParams>(key: K, value: UserListParams[K]) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const stringVal = String(value);
      const defaultVal = String(DEFAULTS[key]);
      if (stringVal === defaultVal) {
        next.delete(key);
      } else {
        next.set(key, stringVal);
      }
      if (PAGE_RESET_KEYS.includes(key)) {
        next.delete("page");
      }
      return next;
    });
  }

  function setMany(updates: Partial<UserListParams>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      let shouldResetPage = false;
      for (const [key, value] of Object.entries(updates) as [
        keyof UserListParams,
        UserListParams[keyof UserListParams],
      ][]) {
        const stringVal = String(value);
        const defaultVal = String(DEFAULTS[key]);
        if (stringVal === defaultVal) {
          next.delete(key);
        } else {
          next.set(key, stringVal);
        }
        if (PAGE_RESET_KEYS.includes(key)) shouldResetPage = true;
      }
      if (shouldResetPage && !("page" in updates)) next.delete("page");
      return next;
    });
  }

  return { params, setParam, setMany };
}
