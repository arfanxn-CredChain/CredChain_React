import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { UserDTO } from "@shared/types/api";
import { userKeys } from "./keys";

export function useUserSelf(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.self(),
    queryFn: async () => {
      const response = await api.get<UserDTO>("/users/self");
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}
