import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@shared/api/client";
import { useStore } from "@app/store";
import { notify } from "@shared/lib/notify";

export function useLogout() {
  const clearUser = useStore((s) => s.clearUser);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: () => {
      clearUser();
      queryClient.clear();
      navigate("/", { replace: true });
      notify.info("auth.logout.success");
    },
  });
}
