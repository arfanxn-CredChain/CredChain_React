import { useSearchParams } from "react-router-dom";

export interface UserListParams {
  page: number;
  search: string;
  sort: string;
  order: "asc" | "desc";
  deleted: "all" | "only" | "none";
  limit: number;
}

const DEFAULTS: UserListParams = {
  page: 1,
  search: "",
  sort: "created_at",
  order: "desc",
  deleted: "all",
  limit: 25,
};

const PAGE_RESET_KEYS: (keyof UserListParams)[] = [
  "search",
  "sort",
  "order",
  "deleted",
  "limit",
];

function parsePage(raw: string | null): number {
  const n = parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function parseLimit(raw: string | null): number {
  const n = parseInt(raw ?? "25", 10);
  return [25, 50, 100].includes(n) ? n : 25;
}

function parseOrder(raw: string | null): "asc" | "desc" {
  return raw === "asc" ? "asc" : "desc";
}

function parseDeleted(raw: string | null): "all" | "only" | "none" {
  if (raw === "only" || raw === "none") return raw;
  return "all";
}

export function useUserListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: UserListParams = {
    page: parsePage(searchParams.get("page")),
    search: searchParams.get("search") ?? DEFAULTS.search,
    sort: searchParams.get("sort") ?? DEFAULTS.sort,
    order: parseOrder(searchParams.get("order")),
    deleted: parseDeleted(searchParams.get("deleted")),
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
