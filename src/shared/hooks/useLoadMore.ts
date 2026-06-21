import { useState, useCallback, useEffect } from "react";
import { useQuery, type QueryKey } from "@tanstack/react-query";
import type { PaginatedResponse } from "@shared/types/api";

const BATCH_SIZE = 50;

export interface UseLoadMoreResult<T> {
  items: T[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
}

export function useLoadMore<T extends { id: string }>(
  queryKey: QueryKey,
  queryFn: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
): UseLoadMoreResult<T> {
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<T[]>([]);

  const query = useQuery({
    queryKey: [...queryKey, page],
    queryFn: () => queryFn(page, BATCH_SIZE),
  });

  const serializedKey = JSON.stringify(queryKey);
  useEffect(() => {
    setPage(1);
    setAllItems([]);
  }, [serializedKey]);

  useEffect(() => {
    if (!query.data) return;
    if (page === 1) {
      setAllItems(query.data.items);
    } else {
      setAllItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const fresh = query.data.items.filter((i) => !existingIds.has(i.id));
        return [...prev, ...fresh];
      });
    }
  }, [query.data, page]);

  const loadMore = useCallback(() => {
    if (query.data && page < query.data.last_page) {
      setPage((p) => p + 1);
    }
  }, [query.data, page]);

  const reset = useCallback(() => {
    setPage(1);
    setAllItems([]);
  }, []);

  return {
    items: allItems,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading && page === 1 && allItems.length === 0,
    isError: query.isError,
    isFetchingNextPage: query.isFetching && page > 1,
    hasMore: query.data ? page < query.data.last_page : false,
    loadMore,
    reset,
  };
}
