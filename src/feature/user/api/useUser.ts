import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { UserDTO } from "@shared/types/api";
import { userKeys } from "./keys";

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<UserDTO>(`/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
